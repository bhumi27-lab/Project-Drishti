import os
import sys
from pathlib import Path
import xml.etree.ElementTree as ET
from sigma.rule import SigmaRule
from sigma_rule_matcher import RuleMatcher

class SigmaScanEngine:
    def __init__(self, rules_dir, logs_dir):
        self.rules_dir = Path(rules_dir)
        self.logs_dir = Path(logs_dir)
        self.matchers = []
        self.events = []

    def parse_sysmon_xml(self, log_file_path):
        """
        Parses Sysmon log files and extracts deep forensic fields.
        """
        parsed_events = []
        try:
            with open(log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read().strip()
            
            if not content.startswith('<Events>') and not content.startswith('<Root>'):
                wrapped_content = f"<Events>\n{content}\n</Events>"
            else:
                wrapped_content = content

            root = ET.fromstring(wrapped_content)
            
            for elem in root.iter():
                if '}' in elem.tag:
                    elem.tag = elem.tag.split('}', 1)[1]

            for event_elem in root.iter('Event'):
                event_data = {}
                
                system_elem = event_elem.find('System')
                if system_elem is not None:
                    for child in system_elem:
                        if child.tag == 'EventID':
                            event_data['EventID'] = child.text
                        elif child.tag == 'Computer':
                            event_data['Computer'] = child.text
                        elif child.tag == 'TimeCreated':
                            event_data['Timestamp'] = child.get('SystemTime', 'N/A')

                event_data_elem = event_elem.find('EventData')
                if event_data_elem is not None:
                    for data_elem in event_data_elem.findall('Data'):
                        name = data_elem.get('Name')
                        if name:
                            event_data[name] = data_elem.text

                if event_data:
                    parsed_events.append(event_data)
                    
        except Exception as e:
            print(f"[-] Error parsing log file {log_file_path}: {e}")
            
        return parsed_events

    def load_rules(self):
        """
        Loads all valid .yml Sigma rules from the rules directory.
        """
        if not self.rules_dir.exists():
            return

        for rule_file in self.rules_dir.glob('*.yml'):
            try:
                with open(rule_file, 'r', encoding='utf-8') as f:
                    raw_yaml = f.read()
                    sigma_rule = SigmaRule.from_yaml(raw_yaml)
                    matcher = RuleMatcher(sigma_rule)
                    
                    tag_strings = []
                    if sigma_rule.tags:
                        for tag in sigma_rule.tags:
                            if hasattr(tag, "name"):
                                tag_strings.append(tag.name)
                            else:
                                tag_strings.append(str(tag))

                    self.matchers.append({
                        "filename": rule_file.name,
                        "title": sigma_rule.title,
                        "id": str(sigma_rule.id) if sigma_rule.id else "N/A",
                        "level": str(sigma_rule.level),
                        "tags": tag_strings,
                        "matcher": matcher
                    })
            except Exception:
                pass

    def group_into_campaigns(self, incidents, rules_dict):
        """
        Level 2 Correlation: Groups incidents into enriched Attack Campaigns (Cases)
        keyed by target host, calculating max severity, associated tactics, and timeline window.
        """
        severity_rank = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        campaigns = {}

        for inc in incidents:
            computer = inc["computer"]
            rule_id = inc["rule_id"]
            rule_info = rules_dict.get(rule_id, {})
            severity = rule_info.get("severity", "low").lower()
            tags = rule_info.get("mitre_tags", [])
            
            first_seen = inc["first_seen"]
            last_seen = inc["last_seen"]

            if computer not in campaigns:
                campaigns[computer] = {
                    "case_id": f"CASE-{computer.split('.')[0].upper()}",
                    "target_host": computer,
                    "max_severity": severity,
                    "associated_tactics": set(tags),
                    "campaign_window": {
                        "first_seen": first_seen,
                        "last_seen": last_seen
                    },
                    "total_incidents": 0,
                    "incident_ids": []
                }
            
            camp = campaigns[computer]
            camp["total_incidents"] += 1
            camp["incident_ids"].append(inc["incident_id"])
            
            # Update max severity if this incident has higher priority
            current_max_sev = camp["max_severity"].lower()
            if severity_rank.get(severity, 1) > severity_rank.get(current_max_sev, 1):
                camp["max_severity"] = severity
            
            # Aggregate MITRE tags
            for tag in tags:
                camp["associated_tactics"].add(tag)
                
            # Expand campaign window if necessary
            if first_seen != "N/A" and (camp["campaign_window"]["first_seen"] == "N/A" or first_seen < camp["campaign_window"]["first_seen"]):
                camp["campaign_window"]["first_seen"] = first_seen
            if last_seen != "N/A" and (camp["campaign_window"]["last_seen"] == "N/A" or last_seen > camp["campaign_window"]["last_seen"]):
                camp["campaign_window"]["last_seen"] = last_seen

        # Convert sets to lists for JSON serialization
        for host, camp in campaigns.items():
            camp["associated_tactics"] = list(camp["associated_tactics"])
            
        return list(campaigns.values())

    def run_targeted_scan(self, selected_attack_name) -> dict:
        self.load_rules()
        
        target_log_file = None
        for log_file in self.logs_dir.glob('*.log'):
            if selected_attack_name.lower() in log_file.name.lower():
                target_log_file = log_file
                break
                
        if not target_log_file:
            return {
                "status": "error",
                "message": f"Target log file for attack '{selected_attack_name}' not found.",
                "raw_matches": 0,
                "rules_triggered": [],
                "campaigns": []
            }

        self.events = self.parse_sysmon_xml(target_log_file)
        
        incident_map = {}
        total_raw_matches = 0

        for event in self.events:
            for item in self.matchers:
                rule_matcher = item["matcher"]
                try:
                    if rule_matcher.match(event):
                        total_raw_matches += 1
                        
                        event_id = event.get('EventID', 'N/A')
                        computer = event.get('Computer', 'N/A')
                        timestamp = event.get('Timestamp', 'N/A')
                        
                        source_image = event.get('SourceImage') or event.get('Image') or 'N/A'
                        target_image = event.get('TargetImage') or 'N/A'
                        granted_access = event.get('GrantedAccess', 'N/A')
                        
                        group_key = (item['id'], source_image, target_image, computer)
                        
                        if group_key not in incident_map:
                            incident_map[group_key] = {
                                "rule_id": item["id"],
                                "rule_title": item["title"],
                                "severity": item["level"],
                                "mitre_tags": item["tags"],
                                "computer": computer,
                                "source_image": source_image,
                                "target_image": target_image,
                                "occurrence_count": 0,
                                "first_seen": timestamp,
                                "last_seen": timestamp,
                                "granted_access_values": set(),
                                "event_ids": set(),
                                "timeline_snippets": []
                            }
                        
                        incident = incident_map[group_key]
                        incident["occurrence_count"] += 1
                        incident["last_seen"] = timestamp
                        incident["event_ids"].add(event_id)
                        if granted_access != 'N/A':
                            incident["granted_access_values"].add(granted_access)
                            
                        if len(incident["timeline_snippets"]) < 2:
                            incident["timeline_snippets"].append(f"[{timestamp}] Event {event_id} | Access: {granted_access}")
                            
                except Exception:
                    continue

        # Build rule-centric hierarchy and flat incident list for campaign analysis
        rules_dict = {}
        all_incidents_flat = []

        for idx, (key, data) in enumerate(incident_map.items(), start=1):
            inc_id = f"INC-{idx:03d}"
            data["incident_id"] = inc_id
            data["granted_access_values"] = list(data["granted_access_values"])
            data["event_ids"] = list(data["event_ids"])
            
            all_incidents_flat.append(data)
            
            rule_id = data["rule_id"]
            if rule_id not in rules_dict:
                rules_dict[rule_id] = {
                    "rule_id": rule_id,
                    "rule_title": data["rule_title"],
                    "severity": data["severity"],
                    "mitre_tags": data["mitre_tags"],
                    "incidents": []
                }
            
            # Clean incident payload without repeating parent rule metadata
            clean_incident = {
                "incident_id": inc_id,
                "rule_id": rule_id, # kept internally for campaign correlation reference
                "computer": data["computer"],
                "source_image": data["source_image"],
                "target_image": data["target_image"],
                "occurrence_count": data["occurrence_count"],
                "first_seen": data["first_seen"],
                "last_seen": data["last_seen"],
                "granted_access_values": data["granted_access_values"],
                "event_ids": data["event_ids"],
                "timeline_snippets": data["timeline_snippets"]
            }
            rules_dict[rule_id]["incidents"].append(clean_incident)

        # Generate enriched campaigns
        campaigns = self.group_into_campaigns(all_incidents_flat, rules_dict)

        # Remove temporary internal rule_id reference from the final rule-centric output if desired, or keep it
        rules_triggered = list(rules_dict.values())
        for r in rules_triggered:
            for inc in r["incidents"]:
                inc.pop("rule_id", None) # Clean up internal helper key

        return {
            "status": "success",
            "target_tested": selected_attack_name,
            "total_rules_compiled": len(self.matchers),
            "total_events_parsed": len(self.events),
            "raw_matches": total_raw_matches,
            "total_unique_rules": len(rules_triggered),
            "total_incidents": len(all_incidents_flat),
            "total_campaigns": len(campaigns),
            "rules_triggered": rules_triggered,
            "campaigns": campaigns
        }
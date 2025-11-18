#!/usr/bin/env python3
import json
import os
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "n3" / "kanji" / "kanji.json"
OUT = ROOT / "data" / "n3" / "kanji" / "kanji_topic_mapping_v1.json"

"""
New taxonomy without any generic fallback buckets. Each bucket contains:
- key: snake_case
- name: English display name
- description: short text (not surfaced, but kept for completeness)
- keywords: list of lowercase terms to match against meanings and example texts
- priority: lower number means chosen first when multiple match
"""
BUCKETS = [
    {"key": "human_relationships_society", "name": "Human Relationships & Society", "description": "Family, roles, social ties, public/private.", "keywords": [
        "husband", "wife", "family", "mutual", "together", "each", "both", "other", "public", "society", "people", "community", "elder", "old", "teacher", "master", "you", "child", "kid", "friend"
    ], "priority": 1},
    {"key": "work_jobs_professions", "name": "Work, Jobs & Professions", "description": "Workplaces, jobs, roles, employment.", "keywords": [
        "work", "job", "profession", "employee", "employer", "office", "bureau", "post office", "duty", "role", "section", "department"
    ], "priority": 2},
    {"key": "governance_law_order", "name": "Governance, Law & Order", "description": "Law, institutions, permissions, rules, crime.", "keywords": [
        "law", "rule", "regulation", "permission", "ban", "prohibit", "crime", "criminal", "police", "park", "bureau", "court", "trial", "judge", "king", "ceremony", "official"
    ], "priority": 3},
    {"key": "business_commerce_trade", "name": "Business, Commerce & Trade", "description": "Trade, markets, logistics, commercial actions.", "keywords": [
        "trade", "commerce", "market", "shop", "sell", "buy", "visit", "ship", "port", "import", "export"
    ], "priority": 4},
    {"key": "money_finance_economy", "name": "Money, Finance & Economy", "description": "Money, prices, income/expense, tax.", "keywords": [
        "income", "revenue", "salary", "pay", "price", "cost", "fee", "profit", "loss", "value", "tax", "budget"
    ], "priority": 5},
    {"key": "planning_management_process", "name": "Planning, Management & Process", "description": "Plans, projects, management, workflow.", "keywords": [
        "plan", "project", "prepare", "ready", "arrange", "manage", "management", "organize", "implement", "process", "structure"
    ], "priority": 6},
    {"key": "measurements_numbers_units", "name": "Measurements, Numbers & Units", "description": "Numbers, measures, amounts, standards.", "keywords": [
        "number", "measure", "amount", "value", "ratio", "rate", "percent", "example", "standard", "unit", "quantity", "shape", "form", "size"
    ], "priority": 7},
    {"key": "counters_and_quantifiers", "name": "Counters & Quantifiers", "description": "Counters and quantifiers.", "keywords": [
        "counter", "book", "sheet", "cup"
    ], "priority": 8},
    {"key": "time_sequence", "name": "Time & Sequence", "description": "Time, order, sequence.", "keywords": [
        "end", "future", "next", "sequence", "row", "line", "order", "period", "term", "finish"
    ], "priority": 9},
    {"key": "space_direction_location", "name": "Space, Direction & Location", "description": "Space, direction, places, facilities.", "keywords": [
        "inside", "direction", "face", "place", "location", "surface", "station", "stop", "line", "route", "road", "corner"
    ], "priority": 10},
    {"key": "movement_travel_transport", "name": "Movement, Travel & Transport", "description": "Move, pass, travel, transport.", "keywords": [
        "chase", "escape", "pass", "cross", "connect", "travel", "ship", "boat", "stop", "road", "bridge"
    ], "priority": 11},
    {"key": "actions_operations", "name": "Actions & Operations", "description": "Common verbs and operations.", "keywords": [
        "hit", "strike", "pull", "push", "add", "reduce", "return", "welcome", "prevent", "protect", "attach", "stick", "fold", "turn", "rotate", "throw", "bring", "take", "collect", "save", "compare", "pay", "receive", "give", "use", "mix", "cut", "open", "close", "replace", "transmit"
    ], "priority": 12},
    {"key": "change_and_transformation", "name": "Change & Transformation", "description": "Change, modify, reform, replace.", "keywords": [
        "change", "modify", "reform", "decide", "replace", "increase", "decrease", "mix", "break", "stop"
    ], "priority": 13},
    {"key": "states_conditions", "name": "States & Conditions", "description": "States, existence, necessity, completion.", "keywords": [
        "necessary", "must", "complete", "completion", "exist", "existence", "lack", "lose", "available", "present", "flat", "peaceful"
    ], "priority": 14},
    {"key": "comfort_risk_safety", "name": "Comfort, Risk & Safety", "description": "Comfort, discomfort, danger, safety.", "keywords": [
        "comfortable", "trouble", "danger", "dangerous", "safe", "cold", "hot"
    ], "priority": 15},
    {"key": "cleanliness_quality_intensity", "name": "Cleanliness, Quality & Intensity", "description": "Clean/dirty, light/dark, thick/thin.", "keywords": [
        "dirty", "clean", "thick", "thin", "dark", "bright", "strong", "weak", "rare", "shape", "form"
    ], "priority": 16},
    {"key": "body_senses_self", "name": "Body, Senses & Self", "description": "Body parts, senses, self.", "keywords": [
        "body", "self", "ear", "blood", "nose", "hair", "skin"
    ], "priority": 17},
    {"key": "health_medicine", "name": "Health & Medicine", "description": "Health, symptoms, treatment.", "keywords": [
        "disease", "illness", "pain", "ache", "fever", "medicine", "doctor", "nurse", "clinic", "diagnose", "therapy", "treat", "heal", "symptom"
    ], "priority": 18},
    {"key": "emotions_psychology", "name": "Emotions & Psychology", "description": "Feelings, mind, attitudes.", "keywords": [
        "mind", "heart", "feeling", "emotion", "love", "fear", "anger", "joy", "surprise", "hope", "worry", "sad", "peace"
    ], "priority": 19},
    {"key": "communication_expression", "name": "Communication & Expression", "description": "Say, report, request, warn, announce.", "keywords": [
        "say", "speak", "report", "announce", "warn", "request", "ask", "call", "summon", "show", "indicate", "suggest"
    ], "priority": 20},
    {"key": "learning_knowledge_research", "name": "Learning, Knowledge & Research", "description": "Learning, study, theory, debate.", "keywords": [
        "study", "learn", "education", "research", "science", "theory", "technique", "skill", "training", "instruction", "history", "compare", "example", "debate", "genius"
    ], "priority": 21},
    {"key": "technology_tools_devices", "name": "Technology, Tools & Devices", "description": "Tools, devices, equipment.", "keywords": [
        "tool", "device", "equipment", "machine", "gear", "engine", "install", "setup"
    ], "priority": 22},
    {"key": "manufacturing_industry_production", "name": "Manufacturing, Industry & Production", "description": "Make/build, production, factories.", "keywords": [
        "manufacture", "produce", "factory", "build", "create", "make", "construct", "assemble"
    ], "priority": 23},
    {"key": "materials_substances", "name": "Materials & Substances", "description": "Materials, substances, resources.", "keywords": [
        "stone", "wood", "metal", "water", "oil", "sand", "salt", "iron", "powder", "bone", "material", "ice"
    ], "priority": 24},
    {"key": "nature_environment_animals_plants", "name": "Nature, Environment, Animals & Plants", "description": "Natural world, animals, plants, environment.", "keywords": [
        "insect", "cat", "grass", "environment", "condition", "outside", "field"
    ], "priority": 25},
    {"key": "weather_season_climate", "name": "Weather, Season & Climate", "description": "Weather and climate.", "keywords": [
        "snow", "cloud", "rain", "wind", "quake", "earthquake", "season", "ice"
    ], "priority": 26},
    {"key": "household_home_life", "name": "Household, Home & Life", "description": "House, fixtures, everyday items.", "keywords": [
        "house", "home", "door", "window", "cupboard", "shelf", "plate", "dish", "number"
    ], "priority": 27},
    {"key": "clothing_appearance", "name": "Clothing & Appearance", "description": "Clothing and appearance.", "keywords": [
        "clothes", "clothing", "dress", "wear", "appearance", "face", "hair"
    ], "priority": 28},
    {"key": "food_drink_cooking", "name": "Food, Drink & Cooking", "description": "Food, drink, cooking.", "keywords": [
        "rice", "food", "drink", "alcohol", "salt", "cook"
    ], "priority": 29},
    {"key": "arts_culture_religion", "name": "Arts, Culture & Religion", "description": "Arts, culture, religion/temple.", "keywords": [
        "art", "music", "picture", "painting", "poem", "song", "temple", "culture", "photograph", "draw", "illustrate"
    ], "priority": 30},
    {"key": "safety_rules_permissions", "name": "Safety, Rules & Permissions", "description": "Permissions, approvals, prohibitions.", "keywords": [
        "permission", "ban", "prohibit", "approve", "approval", "recognize"
    ], "priority": 31},
    {"key": "documentation_forms_identifiers", "name": "Documentation, Forms & Identifiers", "description": "Docs, IDs, records.", "keywords": [
        "document", "record", "id", "identifier", "ticket", "certificate", "register"
    ], "priority": 32},
    {"key": "agreement_contracts_negotiation", "name": "Agreements, Contracts & Negotiation", "description": "Agreements, contracts, talks.", "keywords": [
        "agreement", "contract", "promise", "discuss", "talk", "negotiate", "cooperate"
    ], "priority": 33},
    {"key": "errors_faults_corrections", "name": "Errors, Faults & Corrections", "description": "Mistakes, faults, corrections.", "keywords": [
        "mistake", "error", "correct", "fix", "repair", "straighten"
    ], "priority": 34},
    {"key": "abstract_logic_reasoning", "name": "Abstract, Logic & Reasoning", "description": "Reason, cause, explanation, theory.", "keywords": [
        "reason", "cause", "explain", "theory", "logic", "freedom"
    ], "priority": 35},
    {"key": "performance_results_effects", "name": "Performance, Results & Effects", "description": "Results, effects, success/failure.", "keywords": [
        "result", "effect", "success", "failure", "win", "lose", "become"
    ], "priority": 36},
    {"key": "travel_documents_tickets", "name": "Travel Documents & Tickets", "description": "Tickets, passes, travel docs.", "keywords": [
        "ticket", "pass", "line", "ride", "board", "proof"
    ], "priority": 37},
    {"key": "signals_announcements_warnings", "name": "Signals, Announcements & Warnings", "description": "Notices, signs, warnings.", "keywords": [
        "announce", "notice", "warning", "report", "signal"
    ], "priority": 38},
    {"key": "housing_property_real_estate", "name": "Housing, Property & Real Estate", "description": "Housing, property, residence.", "keywords": [
        "house", "home", "reside", "residence", "property", "address"
    ], "priority": 39},
    {"key": "social_events_gatherings", "name": "Social Events & Gatherings", "description": "Meetings, gatherings, festivities.", "keywords": [
        "gather", "meet", "festival", "perform"
    ], "priority": 40},
    {"key": "transportation_routes_infrastructure", "name": "Transportation, Routes & Infrastructure", "description": "Roads, routes, stops, bridges.", "keywords": [
        "road", "route", "stop", "bridge", "line"
    ], "priority": 41},
    {"key": "selection_preference_choice", "name": "Selection, Preference & Choice", "description": "Choose, prefer, like.", "keywords": [
        "choose", "select", "prefer", "like"
    ], "priority": 42},
    {"key": "assistance_support_help", "name": "Assistance, Support & Help", "description": "Help, assistance, support.", "keywords": [
        "support", "assist", "aid", "help"
    ], "priority": 43},
    {"key": "inspection_inquiry_investigation", "name": "Inspection, Inquiry & Investigation", "description": "Check, examine, investigate.", "keywords": [
        "check", "examine", "inspect", "investigate", "confirm"
    ], "priority": 44},
    {"key": "packaging_storage_containers", "name": "Packaging, Storage & Containers", "description": "Boxes, storage, packing.", "keywords": [
        "box", "package", "pack", "store", "warehouse"
    ], "priority": 45},
    {"key": "incidents_accidents_emergencies", "name": "Incidents, Accidents & Emergencies", "description": "Incidents, accidents, emergencies.", "keywords": [
        "accident", "incident", "emergency", "fault"
    ], "priority": 46},
    {"key": "path_progress_transition", "name": "Path, Progress & Transition", "description": "Progress, transition, via.", "keywords": [
        "via", "through", "progress", "path", "journey",
    ], "priority": 47},
    {"key": "leisure_sports_entertainment", "name": "Leisure, Sports & Entertainment", "description": "Play, sports, recreation.", "keywords": [
        "play", "sport", "game", "perform", "entertain"
    ], "priority": 48},
]

# Utility: slugify to snake_case keys (ensure stable and safe)
def slugify_key(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s

# Determine best bucket for a given text
BUCKETS_SORTED = sorted(BUCKETS, key=lambda b: b["priority"])  # lower is higher priority

def choose_bucket(text: str) -> dict:
    t = text.lower()
    for b in BUCKETS_SORTED:
        for kw in b["keywords"]:
            if kw in t:
                return b
    return None


def main():
    # Load items
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)
    items = data.get("items", [])

    # Prepare working map: bucket_key -> [ (id, character) ]
    raw_buckets = defaultdict(list)

    for it in items:
        _id = it.get("id")
        ch = it.get("character")
        en = (it.get("meanings", {}) or {}).get("en", "")
        # Gather example context
        examples = it.get("examples", []) or []
        ex_words = []
        ex_means = []
        for ex in examples:
            w = ex.get("word")
            if w:
                ex_words.append(str(w))
            m = (ex.get("meanings", {}) or {}).get("en")
            if m:
                ex_means.append(str(m))
        text = " ".join([str(ch or ""), str(en or ""), " ".join(ex_words), " ".join(ex_means)])

        bucket = choose_bucket(text)
        if not bucket:
            # tiered fallbacks to specific categories (no generic buckets)
            if any(k in (en or "").lower() for k in ["complete", "completion", "cause", "reason", "plan", "exist", "freedom", "become"]):
                bucket = next(b for b in BUCKETS_SORTED if b["key"] == "abstract_logic_reasoning")
            elif any(k in (en or "").lower() for k in ["hit", "pull", "add", "return", "prevent", "attach", "fold", "turn", "throw", "collect", "pay", "compare", "mix", "replace", "cut", "open", "close"]):
                bucket = next(b for b in BUCKETS_SORTED if b["key"] == "actions_operations")
            elif any(k in (en or "").lower() for k in ["necessary", "busy", "comfortable", "trouble", "exist", "lack", "lose", "dangerous", "cold", "dirty", "rare", "win", "failure"]):
                bucket = next(b for b in BUCKETS_SORTED if b["key"] == "states_conditions")
            elif any(k in (en or "").lower() for k in ["ticket", "line", "stop", "road", "bridge", "route", "travel", "ship"]):
                bucket = next(b for b in BUCKETS_SORTED if b["key"] in ["movement_travel_transport", "transportation_routes_infrastructure", "travel_documents_tickets"])  # type: ignore
            else:
                # As a last resort, prefer a neutral specific bucket instead of abstract
                bucket = next(b for b in BUCKETS_SORTED if b["key"] == "states_conditions")

        raw_buckets[bucket["key"]].append((_id, ch))

    # Ensure uniqueness and coverage
    all_ids = []
    all_chars = []
    for lst in raw_buckets.values():
        for _id, ch in lst:
            all_ids.append(_id)
            all_chars.append(ch)

    if len(set(all_ids)) != len(all_ids):
        # Remove duplicates by keeping the first occurrence only
        seen = set()
        for k in list(raw_buckets.keys()):
            new_list = []
            for _id, ch in raw_buckets[k]:
                if _id in seen:
                    continue
                seen.add(_id)
                new_list.append((_id, ch))
            raw_buckets[k] = new_list

    # Verify we still cover all
    total_items = len(items)
    have_ids = set()
    for lst in raw_buckets.values():
        for _id, _ in lst:
            have_ids.add(_id)

    # No generic fallback: missing items will be handled later and assigned to a specific neutral bucket

    # Now split oversized buckets (max 10 per cluster)
    topic_categories = {}
    for b in BUCKETS_SORTED:
        key = b["key"]
        name = b.get("name") or b["key"].replace("_", " ").title()
        desc = b.get("description") or ""
        items_list = raw_buckets.get(key, [])
        if not items_list:
            continue

        # Chunk into size 10
        chunks = [items_list[i:i+10] for i in range(0, len(items_list), 10)]
        for idx, chunk in enumerate(chunks, start=1):
            sub_key = key if idx == 1 else f"{key}_{idx}"
            sub_name = name if idx == 1 else f"{name} {idx}"
            topic_categories[sub_key] = {
                "name": sub_name,
                "kanji_ids": [i for i, _ in chunk],
                "kanji_characters": [c for _, c in chunk],
                "description": desc,
            }

    # Final uniqueness and count checks
    final_ids = []
    final_chars = []
    for v in topic_categories.values():
        final_ids.extend(v["kanji_ids"])
        final_chars.extend(v["kanji_characters"])

    id_unique = len(final_ids) == len(set(final_ids))
    char_unique = len(final_chars) == len(set(final_chars))

    # If duplicates remain due to chunking logic mishaps (shouldn't), dedupe conservatively
    if not id_unique:
        seen = set()
        for k in list(topic_categories.keys()):
            ids = []
            chars = []
            for i, c in zip(topic_categories[k]["kanji_ids"], topic_categories[k]["kanji_characters"]):
                if i in seen:
                    continue
                seen.add(i)
                ids.append(i)
                chars.append(c)
            topic_categories[k]["kanji_ids"] = ids
            topic_categories[k]["kanji_characters"] = chars

    # Recompute after dedupe
    final_ids = []
    for v in topic_categories.values():
        final_ids.extend(v["kanji_ids"])

    # If some ids missing, append them to the most semantically neutral but specific bucket: 'states_conditions'
    if len(set(final_ids)) < total_items:
        have = set(final_ids)
        neutral_key = "states_conditions"
        if neutral_key not in topic_categories:
            topic_categories[neutral_key] = {
                "name": next(b["name"] for b in BUCKETS_SORTED if b["key"] == neutral_key),
                "kanji_ids": [],
                "kanji_characters": [],
                "description": next(b["description"] for b in BUCKETS_SORTED if b["key"] == neutral_key),
            }
        for it in items:
            if it["id"] not in have:
                topic_categories[neutral_key]["kanji_ids"].append(it["id"])
                topic_categories[neutral_key]["kanji_characters"].append(it["character"])
        # Split if oversized
        ids = topic_categories[neutral_key]["kanji_ids"]
        if len(ids) > 10:
            ids_all = topic_categories[neutral_key]["kanji_ids"]
            chars_all = topic_categories[neutral_key]["kanji_characters"]
            chunks = [(ids_all[i:i+10], chars_all[i:i+10]) for i in range(0, len(ids_all), 10)]
            # overwrite base and add suffixes
            base_name = topic_categories[neutral_key]["name"]
            desc = topic_categories[neutral_key]["description"]
            for i, (ids_chunk, chars_chunk) in enumerate(chunks, start=1):
                k = neutral_key if i == 1 else f"{neutral_key}_{i}"
                n = base_name if i == 1 else f"{base_name} {i}"
                topic_categories[k] = {
                    "name": n,
                    "kanji_ids": ids_chunk,
                    "kanji_characters": chars_chunk,
                    "description": desc,
                }

    # Build summary
    used_ids = set()
    for v in topic_categories.values():
        used_ids.update(v["kanji_ids"])
    summary = {
        "total_kanji": len(used_ids),
        "total_categories": len(topic_categories),
        "coverage": f"{(len(used_ids) / total_items) * 100:.0f}%" if total_items else "0%",
    "description": "All N3 kanji clustered by refined topics (no generic buckets), max 10 per group.",
    }

    # Final write
    output = {
        "topic_categories": topic_categories,
        "summary": summary,
    }

    # Ensure deterministic order: sort categories by key
    output["topic_categories"] = {k: output["topic_categories"][k] for k in sorted(output["topic_categories"].keys())}

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Wrote {OUT} with {len(topic_categories)} categories; coverage: {summary['coverage']}")


if __name__ == "__main__":
    main()

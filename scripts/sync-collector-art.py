#!/usr/bin/env python3
"""
Marvel Multiverse & Omnibus Atlas — Real Collector Artwork Archiver
Downloads verified character & multiverse-variant portrait/comic-art plates
from Marvel Database (marvel.fandom.com) into public/assets/art/ so the app
keeps strict `img-src 'self' data:` CSP with zero external runtime hotlinks.
"""

import json
import os
import re
import struct
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART_DIR = ROOT / "public" / "assets" / "art"
MANIFEST_JS = ROOT / "public" / "js" / "data" / "art_manifest.js"
CHARS_JS = ROOT / "public" / "js" / "data" / "characters.js"

API_URL = "https://marvel.fandom.com/api.php"
USER_AGENT = "MarvelMultiverseAtlasArchiver/1.0 (https://marvel-atlas.web.app; collector-art-sync)"

# Curated primary wiki page candidates per canonical character ID (all 76)
CHAR_WIKI_CANDIDATES = {
    "wolverine": ["James_Howlett_(Earth-616)", "Wolverine"],
    "jean-grey": ["Jean_Grey_(Earth-616)", "Jean_Grey"],
    "cyclops": ["Scott_Summers_(Earth-616)", "Cyclops"],
    "storm": ["Ororo_Munroe_(Earth-616)", "Storm"],
    "magneto": ["Max_Eisenhardt_(Earth-616)", "Magneto"],
    "professor-x": ["Charles_Xavier_(Earth-616)", "Professor_X"],
    "rogue": ["Anna_Marie_(Earth-616)", "Rogue"],
    "gambit": ["Remy_LeBeau_(Earth-616)", "Gambit"],
    "nightcrawler": ["Kurt_Wagner_(Earth-616)", "Nightcrawler"],
    "emma-frost": ["Emma_Frost_(Earth-616)", "Emma_Frost"],
    "kitty-pryde": ["Katherine_Pryde_(Earth-616)", "Shadowcat"],
    "colossus": ["Piotr_Rasputin_(Earth-616)", "Colossus"],
    "beast": ["Henry_McCoy_(Earth-616)", "Beast"],
    "psylocke": ["Kwannon_(Earth-616)", "Elizabeth_Braddock_(Earth-616)"],
    "cable": ["Nathan_Summers_(Earth-616)", "Cable"],
    "deadpool": ["Wade_Wilson_(Earth-616)", "Deadpool"],
    "iron-man": ["Anthony_Stark_(Earth-616)", "Iron_Man"],
    "captain-america": ["Steven_Rogers_(Earth-616)", "Captain_America"],
    "thor": ["Thor_Odinson_(Earth-616)", "Thor"],
    "hulk": ["Bruce_Banner_(Earth-616)", "Hulk"],
    "scarlet-witch": ["Wanda_Maximoff_(Earth-616)", "Scarlet_Witch"],
    "doctor-strange": ["Stephen_Strange_(Earth-616)", "Doctor_Strange"],
    "black-panther": ["T'Challa_(Earth-616)", "Black_Panther"],
    "captain-marvel": ["Carol_Danvers_(Earth-616)", "Captain_Marvel"],
    "black-widow": ["Natalia_Romanova_(Earth-616)", "Black_Widow"],
    "hawkeye": ["Clinton_Barton_(Earth-616)", "Hawkeye"],
    "vision": ["Vision_(Earth-616)", "Vision"],
    "ant-man-wasp": ["Janet_van_Dyne_(Earth-616)", "Henry_Pym_(Earth-616)"],
    "sentry": ["Robert_Reynolds_(Earth-616)", "Sentry"],
    "spider-man": ["Peter_Parker_(Earth-616)", "Spider-Man"],
    "miles-morales": ["Miles_Morales_(Earth-1610)", "Miles_Morales"],
    "spider-gwen": ["Gwendolyn_Stacy_(Earth-65)", "Spider-Gwen"],
    "spider-man-2099": ["Miguel_O'Hara_(Earth-928)", "Spider-Man_2099"],
    "daredevil": ["Matthew_Murdock_(Earth-616)", "Daredevil"],
    "moon-knight": ["Marc_Spector_(Earth-616)", "Moon_Knight"],
    "ghost-rider": ["Johnathon_Blaze_(Earth-616)", "Ghost_Rider"],
    "blade": ["Eric_Brooks_(Earth-616)", "Blade"],
    "mister-fantastic": ["Reed_Richards_(Earth-616)", "Mister_Fantastic"],
    "invisible-woman": ["Susan_Storm_(Earth-616)", "Invisible_Woman"],
    "silver-surfer": ["Norrin_Radd_(Earth-616)", "Silver_Surfer"],
    "adam-warlock": ["Adam_Warlock_(Earth-616)", "Adam_Warlock"],
    "franklin-richards": ["Franklin_Richards_(Earth-616)", "Franklin_Richards"],
    "loki": ["Loki_Laufeyson_(Earth-616)", "Loki"],
    "uatu-watcher": ["Uatu_(Earth-616)", "Uatu"],
    "doctor-doom": ["Victor_von_Doom_(Earth-616)", "Doctor_Doom"],
    "thanos": ["Thanos_(Earth-616)", "Thanos"],
    "kang": ["Nathaniel_Richards_(Kang)_(Earth-6311)", "Kang_the_Conqueror"],
    "apocalypse": ["En_Sabah_Nur_(Earth-616)", "Apocalypse"],
    "mister-sinister": ["Nathaniel_Essex_(Earth-616)", "Mister_Sinister"],
    "galactus": ["Galan_(Earth-616)", "Galactus"],
    "ultron": ["Ultron_(Earth-616)", "Ultron"],
    "venom-knull": ["Edward_Brock_(Earth-616)", "Venom_(Symbiote)_(Earth-616)"],
    "magik": ["Illyana_Rasputina_(Earth-616)", "Magik"],
    "iceman": ["Robert_Drake_(Earth-616)", "Iceman"],
    "laura-kinney": ["Laura_Kinney_(Earth-616)", "X-23"],
    "mystique": ["Raven_Darkhölme_(Earth-616)", "Mystique"],
    "the-thing": ["Benjamin_Grimm_(Earth-616)", "Thing"],
    "human-torch": ["Jonathan_Storm_(Earth-616)", "Human_Torch"],
    "namor": ["Namor_McKenzie_(Earth-616)", "Namor"],
    "black-bolt": ["Blackagar_Boltagon_(Earth-616)", "Black_Bolt"],
    "star-lord": ["Peter_Quill_(Earth-616)", "Star-Lord"],
    "shang-chi": ["Shang-Chi_(Earth-616)", "Shang-Chi"],
    "ms-marvel": ["Kamala_Khan_(Earth-616)", "Ms._Marvel"],
    "juggernaut": ["Cain_Marko_(Earth-616)", "Juggernaut"],
    "beta-ray-bill": ["Beta_Ray_Bill_(Earth-616)", "Beta_Ray_Bill"],
    "blue-marvel": ["Adam_Brashear_(Earth-616)", "Blue_Marvel"],
    "nova": ["Richard_Rider_(Earth-616)", "Nova"],
    "she-hulk": ["Jennifer_Walters_(Earth-616)", "She-Hulk"],
    "bishop": ["Lucas_Bishop_(Earth-1191)", "Bishop"],
    "archangel": ["Warren_Worthington_III_(Earth-616)", "Archangel"],
    "doctor-octopus": ["Otto_Octavius_(Earth-616)", "Doctor_Octopus"],
    "green-goblin": ["Norman_Osborn_(Earth-616)", "Green_Goblin"],
    "punisher": ["Frank_Castle_(Earth-616)", "Punisher"],
    "america-chavez": ["America_Chavez_(Earth-616)", "America_Chavez"],
    "molecule-man": ["Owen_Reece_(Earth-616)", "Molecule_Man"],
    "mephisto": ["Mephisto_(Earth-616)", "Mephisto"],
}

# Curated distinct wiki page candidates for Multiverse Variants (keyed by "charId--variantId")
VARIANT_WIKI_CANDIDATES = {
    "wolverine--weapon-x-aoa": ["James_Howlett_(Earth-295)"],
    "wolverine--old-man-logan": ["James_Howlett_(Earth-807128)"],
    "wolverine--hellverine-phoenix": ["James_Howlett_(Earth-14412)", "Thor_Vol_5_6"],
    "jean-grey--dark-phoenix": ["Uncanny_X-Men_Vol_1_135", "Phoenix_Force_(Earth-616)"],
    "jean-grey--white-phoenix-crown": ["New_X-Men_Vol_1_154", "Jean_Grey_(White_Phoenix_of_the_Crown)"],
    "jean-grey--aoa-jean-grey": ["Jean_Grey_(Earth-295)"],
    "cyclops--phoenix-five-cyclops": ["Avengers_vs._X-Men_Vol_1_11", "Uncanny_X-Men_Vol_2_15"],
    "cyclops--prelate-summers": ["Scott_Summers_(Earth-295)"],
    "storm--punk-mohawk-storm": ["Uncanny_X-Men_Vol_1_173", "Uncanny_X-Men_Vol_1_201"],
    "storm--goddess-of-thunder": ["Ororo_Munroe_(Earth-904)", "What_If...%3F_(TV_series)", "X-Men_Annual_Vol_1_9"],
    "storm--eternal-storm": ["Storm_Vol_5_1"],
    "magneto--krakoa-white-suit": ["House_of_X_Vol_1_1", "X-Men_Vol_5_4"],
    "magneto--aoa-leader-magneto": ["Max_Eisenhardt_(Earth-295)"],
    "magneto--king-magnus-hom": ["Max_Eisenhardt_(Earth-58163)", "House_of_M_Vol_1_1"],
    "professor-x--hox-cerebro-x": ["House_of_X_Vol_1_6", "Powers_of_X_Vol_1_1"],
    "professor-x--illuminati-838": ["Charles_Xavier_(Earth-838)"],
    "professor-x--onslaught-entity": ["Onslaught_(Psychic_Entity)_(Earth-616)"],
    "rogue--aoa-rogue": ["Anna_Marie_(Earth-295)", "Rogue_(Earth-295)"],
    "gambit--death-horseman": ["X-Men_Vol_2_185"],
    "gambit--new-sun-9921": ["Remy_LeBeau_(Earth-9921)"],
    "nightcrawler--uncanny-spider-kurt": ["Uncanny_Spider-Man_Vol_1_1"],
    "nightcrawler--aoa-kurt-darkholme": ["Kurt_Darkhölme_(Earth-295)", "Kurt_Wagner_(Earth-295)"],
    "emma-frost--phoenix-five-emma": ["Uncanny_X-Men_Vol_2_16"],
    "emma-frost--iron-queen-mysterium": ["Invincible_Iron_Man_Vol_5_10"],
    "kitty-pryde--kate-pryde-811": ["Katherine_Pryde_(Earth-811)"],
    "kitty-pryde--shadowkat-ninja": ["X-Men_Vol_6_25"],
    "colossus--unstoppable-colossus": ["Uncanny_X-Men_Vol_1_542", "Uncanny_X-Men_Vol_2_1"],
    "colossus--aoa-colossus": ["Piotr_Rasputin_(Earth-295)"],
    "beast--dark-beast-295": ["Henry_McCoy_(Earth-295)"],
    "beast--krakoan-xforce-director": ["X-Force_Vol_6_1"],
    "psylocke--betsy-captain-britain": ["Elizabeth_Braddock_(Earth-616)"],
    "psylocke--crimson-dawn-90s": ["X-Men_Vol_2_1"],
    "cable--savior-cable": ["Cable_%26_Deadpool_Vol_1_9"],
    "cable--nate-grey-xman": ["Nathaniel_Grey_(Earth-295)"],
    "deadpool--xforce-grey-wade": ["Uncanny_X-Force_Vol_1_1"],
    "deadpool--dreadpool-12101": ["Wade_Wilson_(Earth-12101)"],
    "iron-man--godbuster-tony": ["Iron_Man_Armor_Model_63", "Tony_Stark:_Iron_Man_Vol_1_11"],
    "iron-man--superior-iron-man": ["Iron_Man_Armor_Model_50", "Superior_Iron_Man_Vol_1_1"],
    "iron-man--iron-lad-6160": ["Anthony_Stark_(Earth-6160)"],
    "captain-america--worthy-cap-mjolnir": ["Steven_Rogers_(Earth-199999)"],
    "captain-america--sam-wilson-cap": ["Samuel_Wilson_(Earth-616)"],
    "captain-america--ultimate-cap-1610": ["Steven_Rogers_(Earth-1610)"],
    "thor--rune-king-thor": ["Thor_Vol_2_85"],
    "thor--jane-foster-mighty": ["Jane_Foster_(Earth-616)"],
    "thor--cosmic-king-thor": ["Thor_Vol_6_1"],
    "hulk--immortal-devil-hulk": ["Immortal_Hulk_Vol_1_1"],
    "hulk--joe-fixit-professor": ["Incredible_Hulk_Vol_1_377", "Joe_Fixit_(Earth-616)"],
    "hulk--maestro-9200": ["Bruce_Banner_(Earth-9200)"],
    "scarlet-witch--house-of-m-wanda": ["Wanda_Maximoff_(Earth-58163)", "House_of_M_Vol_1_7"],
    "scarlet-witch--scarlet-witch-199999": ["Wanda_Maximoff_(Earth-199999)"],
    "doctor-strange--black-priest-strange": ["New_Avengers_Vol_3_27"],
    "doctor-strange--strange-supreme-whatif": ["Stephen_Strange_(Earth-91233)"],
    "black-panther--shuri-griot-panther": ["Shuri_(Earth-616)"],
    "black-panther--infinity-gauntlet-tchalla": ["Secret_Wars_Vol_1_7"],
    "captain-marvel--binary-uncanny-164": ["Uncanny_X-Men_Vol_1_164"],
    "captain-marvel--maria-rambeau-838": ["Maria_Rambeau_(Earth-838)"],
    "black-widow--symbiote-widow-sliver": ["Venom_Vol_5_26", "Black_Widow:_Venomous_Vol_1_1"],
    "black-widow--worthy-widow-age-of-ultron": ["Natalia_Romanova_(Earth-23223)", "Natalia_Romanova_(Earth-199999)"],
    "hawkeye--ronin-clint": ["New_Avengers_Vol_1_30"],
    "hawkeye--wasteland-hawkeye": ["Clinton_Barton_(Earth-807128)"],
    "vision--white-vision": ["West_Coast_Avengers_Vol_2_45", "Vision_(Earth-199999)"],
    "vision--infinity-ultron-vision": ["Ultron_(Earth-29929)"],
    "ant-man-wasp--scientist-supreme-pym": ["Henry_Pym_(Earth-616)"],
    "ant-man-wasp--scott-lang-ff": ["Scott_Lang_(Earth-616)"],
    "sentry--merged-red-sentry": ["Sentry_Vol_3_4"],
    "sentry--the-void": ["Void_(Earth-616)"],
    "spider-man--symbiote-black-suit": ["Marvel_Super_Heroes_Secret_Wars_Vol_1_8", "Amazing_Spider-Man_Vol_1_252"],
    "spider-man--cosmic-captain-universe": ["Peter_Parker_(Earth-13)"],
    "spider-man--ultimate-peter-6160": ["Peter_Parker_(Earth-6160)"],
    "miles-morales--ultimate-miles-1610": ["Ultimate_Comics_Spider-Man_Vol_1_1"],
    "miles-morales--prowler-miles-42": ["Miles_G._Morales_(Earth-42)"],
    "spider-gwen--gwenom-65": ["Spider-Gwen_Vol_2_25"],
    "spider-gwen--gwenpool-trn565": ["Gwendolyn_Poole_(Earth-TRN565)"],
    "spider-man-2099--all-new-white-2099": ["Spider-Man_2099_Vol_3_1"],
    "spider-man-2099--spider-society-928b": ["Miguel_O'Hara_(Earth-928B)"],
    "daredevil--king-of-fist-matt": ["Daredevil_Vol_7_1"],
    "daredevil--kingpin-murdock-65": ["Matthew_Murdock_(Earth-65)"],
    "moon-knight--age-of-khonshu-marc": ["Avengers_Vol_8_33"],
    "moon-knight--arachknight-warp": ["Peter_Parker_(Warp_World)_(Earth-616)"],
    "ghost-rider--cosmic-ghost-rider": ["Frank_Castle_(Earth-TRN666)"],
    "ghost-rider--all-rider-robbie": ["Roberto_Reyes_(Earth-616)"],
    "blade--ronin-spider-hero-blade": ["Mighty_Avengers_Vol_2_1"],
    "blade--khonshu-knight-blade": ["Eric_Brooks_(Earth-89521)", "Eric_Brooks_(Earth-199999)"],
    "mister-fantastic--the-maker-1610": ["Reed_Richards_(Earth-1610)"],
    "mister-fantastic--doom-reed-6160": ["Reed_Richards_(Earth-6160)"],
    "mister-fantastic--council-gauntlet-reed": ["Fantastic_Four_Vol_1_570"],
    "invisible-woman--future-foundation-sue": ["FF_Vol_1_1"],
    "invisible-woman--malice-sue": ["Fantastic_Four_Vol_1_280"],
    "silver-surfer--silver-surfer-black": ["Silver_Surfer:_Black_Vol_1_1"],
    "silver-surfer--fallen-one-worthy": ["Norrin_Radd_(Earth-TRN666)"],
    "adam-warlock--living-tribunal-adam": ["Adam_Warlock_(Earth-19141)"],
    "adam-warlock--the-magus": ["Adam_Warlock_(Earth-7528)", "Magus_(Earth-7528)"],
    "franklin-richards--adult-franklin-galactus": ["Fantastic_Four_Vol_1_604"],
    "loki--yggdrasil-loki-tva": ["Loki_Laufeyson_(Earth-TRN732)", "Loki_Laufeyson_(Earth-199999)"],
    "loki--classic-siege-loki": ["Avengers_Vol_1_1"],
    "uatu-watcher--oathbreaker-watcher": ["Uatu_(Earth-199999)", "Watcher_(Earth-199999)"],
    "doctor-doom--god-emperor-doom": ["Secret_Wars_Vol_1_2", "Secret_Wars_Vol_1_8"],
    "doctor-doom--sorcerer-supreme-doom": ["One_World_Under_Doom_Vol_1_1", "Blood_Hunt_Vol_1_5"],
    "doctor-doom--infamous-iron-man": ["Infamous_Iron_Man_Vol_1_1"],
    "thanos--infinity-gauntlet-thanos": ["Infinity_Gauntlet_Vol_1_1"],
    "thanos--king-thanos-end": ["Thanos_(Earth-TRN666)"],
    "kang--he-who-remains": ["Nathaniel_Richards_(He_Who_Remains)_(Earth-199999)"],
    "kang--immortus-limbo": ["Nathaniel_Richards_(Immortus)_(Earth-6311)"],
    "apocalypse--aoa-emperor-295": ["En_Sabah_Nur_(Earth-295)"],
    "mister-sinister--enigma-dominion": ["Nathaniel_Essex_(Enigma)_(Earth-616)", "Rise_of_the_Powers_of_X_Vol_1_1"],
    "galactus--lifebringer-galactus": ["Ultimates_Vol_3_2"],
    "ultron--phalanx-conquest-ultron": ["Annihilation:_Conquest_Vol_1_6"],
    "ultron--infinity-ultron": ["Ultron_(Earth-29929)"],
    "venom-knull--king-in-black-eddie": ["King_in_Black_Vol_1_5", "Venom_Vol_4_35"],
    "venom-knull--knull-lord-abyss": ["Knull_(Earth-616)"],
    "magik--phoenix-five-magik": ["Uncanny_X-Men_Vol_2_17"],
    "magik--sorcerer-supreme-illyana": ["Illyana_Rasputina_(Earth-99062)"],
    "iceman--aoa-iceman-295": ["Robert_Drake_(Earth-295)"],
    "laura-kinney--vault-talon-laura": ["Laura_Kinney_(Talon)_(Earth-616)"],
    "the-thing--angrir-breaker-of-souls": ["Fear_Itself_Vol_1_4"],
    "the-thing--infinity-thing-shield": ["Benjamin_Grimm_(Earth-15513)", "Secret_Wars_Vol_1_6"],
    "human-torch--negative-zone-lord-johnny": ["Fantastic_Four_Vol_1_600"],
    "namor--phoenix-five-namor": ["Avengers_vs._X-Men_Vol_1_8"],
    "namor--kukulkan-talokan": ["Namor_(Earth-199999)"],
    "black-bolt--illuminati-838-bolt": ["Blackagar_Boltagon_(Earth-838)"],
    "star-lord--annihilation-quill": ["Annihilation:_Conquest_-_Starlord_Vol_1_1"],
    "star-lord--star-lord-tchalla": ["T'Challa_(Earth-21818)"],
    "juggernaut--trion-juggernaut": ["Uncanny_X-Men_Vol_1_369"],
    "beta-ray-bill--twilight-sword-bill": ["Beta_Ray_Bill_Vol_1_5"],
    "blue-marvel--1962-masked-legend": ["Adam:_Legend_of_the_Blue_Marvel_Vol_1_1"],
    "nova--new-warriors-centurion": ["New_Warriors_Vol_1_1"],
    "she-hulk--celestial-winter-hulk": ["Avengers_Vol_8_49"],
    "bishop--aoa-anchor-bishop": ["Lucas_Bishop_(Earth-295)"],
    "archangel--dark-angel-ascendant": ["Uncanny_X-Force_Vol_1_14"],
    "doctor-octopus--superior-spider-otto": ["Superior_Spider-Man_Vol_1_1"],
    "doctor-octopus--master-planner-616": ["Amazing_Spider-Man_Vol_1_33"],
    "green-goblin--iron-patriot-osborn": ["Dark_Avengers_Vol_1_1"],
    "green-goblin--red-goblin-800": ["Amazing_Spider-Man_Vol_1_798"],
    "punisher--war-machine-punisher": ["Punisher_Vol_11_218"],
    "america-chavez--eternity-mask-america": ["Defenders:_Beyond_Vol_1_1"],
    "molecule-man--secret-wars-1984-owen": ["Marvel_Super_Heroes_Secret_Wars_Vol_1_12"],
    "mephisto--council-of-red-prime": ["Avengers_Vol_8_63"],
}


def api_get(params):
    qs = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"{API_URL}?{qs}", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=25) as resp:
        return json.loads(resp.read().decode("utf-8"))


def query_pageimages_batch(titles):
    """Returns dict of normalized_or_orig_title -> (thumb_url, orig_url, resolved_title)"""
    results = {}
    unique = []
    seen = set()
    for t in titles:
        clean = urllib.parse.unquote(t).replace("_", " ")
        if clean not in seen:
            seen.add(clean)
            unique.append(clean)

    for i in range(0, len(unique), 25):
        batch = unique[i:i + 25]
        try:
            data = api_get({
                "action": "query",
                "format": "json",
                "redirects": "1",
                "prop": "pageimages",
                "piprop": "original|thumbnail",
                "pithumbsize": "520",
                "titles": "|".join(batch),
            })
        except Exception as exc:
            print(f"[warn] batch query failed ({i}): {exc}", file=sys.stderr)
            continue

        q = data.get("query", {})
        norm_map = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir_map = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages_by_title = {}
        for page in q.get("pages", {}).values():
            if "missing" in page:
                continue
            thumb = page.get("thumbnail", {}).get("source")
            orig = page.get("original", {}).get("source")
            if thumb or orig:
                pages_by_title[page["title"]] = (thumb, orig, page["title"])

        for orig_q in batch:
            cur = norm_map.get(orig_q, orig_q)
            for _ in range(5):
                if cur in redir_map:
                    cur = redir_map[cur]
                else:
                    break
            if cur in pages_by_title:
                results[orig_q] = pages_by_title[cur]
        time.sleep(0.15)
    return results


def search_fallback_title(query_str):
    try:
        data = api_get({
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": query_str,
            "srlimit": "5",
        })
        hits = [h["title"] for h in data.get("query", {}).get("search", [])]
        if not hits:
            return None
        res = query_pageimages_batch(hits)
        for h in hits:
            if h in res:
                return res[h]
    except Exception as exc:
        print(f"[warn] search fallback '{query_str}' failed: {exc}", file=sys.stderr)
    return None


def get_image_info(data: bytes):
    """Verify magic bytes & extract (ext, width, height) in pure Python."""
    if len(data) < 2500:
        return None
    # PNG
    if data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) >= 24:
        w, h = struct.unpack(">II", data[16:24])
        return ("png", w, h)
    # WEBP
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP" and len(data) >= 30:
        chunk = data[12:16]
        w = h = 0
        if chunk == b"VP8X" and len(data) >= 30:
            w = 1 + int.from_bytes(data[24:27], "little")
            h = 1 + int.from_bytes(data[27:30], "little")
        elif chunk == b"VP8 " and len(data) >= 30:
            w = struct.unpack("<H", data[26:28])[0] & 0x3FFF
            h = struct.unpack("<H", data[28:30])[0] & 0x3FFF
        elif chunk == b"VP8L" and len(data) >= 25:
            b0, b1, b2, b3 = data[21:25]
            w = 1 + (((b1 & 0x3F) << 8) | b0)
            h = 1 + (((b3 & 0x0F) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6))
        return ("webp", w, h)
    # JPEG
    if data[:3] == b"\xff\xd8\xff":
        idx = 2
        w = h = 0
        n = len(data)
        while idx + 4 < n:
            if data[idx] != 0xFF:
                idx += 1
                continue
            marker = data[idx + 1]
            idx += 2
            if marker in (0xD8, 0xD9, 0x01) or (0xD0 <= marker <= 0xD7):
                continue
            if idx + 2 > n:
                break
            seg_len = struct.unpack(">H", data[idx:idx + 2])[0]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                if idx + 7 <= n:
                    h, w = struct.unpack(">HH", data[idx + 3:idx + 7])
                    break
            if seg_len < 2:
                break
            idx += seg_len
        return ("jpg", w, h)
    return None


def compute_focal(w, h):
    if not w or not h:
        return "center 18%"
    ratio = h / max(w, 1)
    if ratio >= 1.35:
        return "center 15%"
    if ratio >= 1.05:
        return "center 18%"
    if ratio >= 0.85:
        return "center 22%"
    return "center 25%"


def download_one(key, url_candidates, source_title):
    for existing in ART_DIR.glob(f"{key}.*"):
        info = get_image_info(existing.read_bytes())
        if info:
            ext, w, h = info
            return (key, f"./assets/art/{existing.name}", w, h, compute_focal(w, h), source_title, "cached")

    for url in url_candidates:
        if not url:
            continue
        # Ensure we use a sensible scaled thumbnail URL if it's a huge Wikia original
        dl_url = url
        try:
            req = urllib.request.Request(dl_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=25) as resp:
                raw = resp.read()
            info = get_image_info(raw)
            if not info:
                continue
            ext, w, h = info
            if w and h and (w < 120 or h < 120):
                continue
            out = ART_DIR / f"{key}.{ext}"
            out.write_bytes(raw)
            return (key, f"./assets/art/{out.name}", w, h, compute_focal(w, h), source_title, "downloaded")
        except Exception:
            continue
    return None


def parse_characters():
    src = CHARS_JS.read_text(encoding="utf-8")
    blocks = re.split(r"\n    \{\n      id: '", src)
    chars = []
    for b in blocks[1:]:
        cid = b.split("'", 1)[0]
        m_name = re.search(r"name: '([^']+)'", b)
        vars_block = b.split("variants: [", 1)[1] if "variants: [" in b else ""
        variants = re.findall(r"id: '([^']+)',[\s\S]*?name: '([^']+)',[\s\S]*?earth: '([^']+)'", vars_block)
        chars.append({
            "id": cid,
            "name": m_name.group(1) if m_name else cid,
            "variants": [{"id": vid, "name": vname, "earth": vearth} for vid, vname, vearth in variants],
        })
    return chars


def main():
    ART_DIR.mkdir(parents=True, exist_ok=True)
    chars = parse_characters()
    print(f"Loaded {len(chars)} characters from characters.js")

    # 1. Gather all candidate wiki titles
    all_titles = []
    for c_list in CHAR_WIKI_CANDIDATES.values():
        all_titles.extend(c_list)
    for v_list in VARIANT_WIKI_CANDIDATES.values():
        all_titles.extend(v_list)

    print(f"Querying Marvel Database API for {len(all_titles)} titles...")
    pageimages = query_pageimages_batch(all_titles)
    print(f"Resolved {len(pageimages)} page images from batch queries.")

    # 2. Resolve download jobs for base chars + distinct variants
    jobs = {}  # key -> ([urls], source_title)
    missing_chars = []
    for ch in chars:
        cid = ch["id"]
        cands = CHAR_WIKI_CANDIDATES.get(cid, [f"{ch['name'].replace(' ', '_')}_(Earth-616)", ch["name"].replace(" ", "_")])
        found = None
        for t in cands:
            clean = urllib.parse.unquote(t).replace("_", " ")
            if clean in pageimages:
                found = pageimages[clean]
                break
        if not found:
            found = search_fallback_title(f"{ch['name']} Earth-616") or search_fallback_title(ch["name"])
        if found:
            thumb, orig, rtitle = found
            jobs[cid] = ([thumb, orig], rtitle)
        else:
            missing_chars.append(cid)

    # Variants
    variant_hits = 0
    for ch in chars:
        cid = ch["id"]
        for v_idx, v in enumerate(ch["variants"]):
            key = f"{cid}--{v['id']}"
            if v_idx == 0 and key not in VARIANT_WIKI_CANDIDATES:
                continue
            cands = VARIANT_WIKI_CANDIDATES.get(key, [])
            found = None
            for t in cands:
                clean = urllib.parse.unquote(t).replace("_", " ")
                if clean in pageimages:
                    found = pageimages[clean]
                    break
            if found:
                thumb, orig, rtitle = found
                # Avoid duplicating exact same source page as the base character
                base_title = jobs[cid][1] if cid in jobs else None
                if rtitle != base_title:
                    jobs[key] = ([thumb, orig], rtitle)
                    variant_hits += 1

    print(f"Jobs queued: {len(jobs)} (base chars: {len(chars) - len(missing_chars)}/{len(chars)}, distinct variants: {variant_hits})")
    if missing_chars:
        print(f"Missing base chars before download: {missing_chars}")

    # 3. Download concurrently
    manifest_chars = {}
    manifest_variants = {}
    failed_jobs = []
    with ThreadPoolExecutor(max_workers=10) as pool:
        futs = {
            pool.submit(download_one, key, urls, rtitle): (key, rtitle)
            for key, (urls, rtitle) in jobs.items()
        }
        done = 0
        for fut in as_completed(futs):
            done += 1
            key, rtitle = futs[fut]
            res = fut.result()
            if res is None:
                failed_jobs.append((key, rtitle))
                continue
            k, rel_path, w, h, focal, src_title, mode = res
            entry = {
                "localPath": rel_path,
                "width": w,
                "height": h,
                "focalPoint": focal,
                "sourceTitle": src_title,
            }
            if "--" in k:
                manifest_variants[k] = entry
            else:
                manifest_chars[k] = entry
            if done % 25 == 0 or done == len(jobs):
                print(f"  Progress: {done}/{len(jobs)}")

    print(f"Downloaded/cached base characters: {len(manifest_chars)}/{len(chars)}")
    print(f"Downloaded/cached distinct variants: {len(manifest_variants)}")
    if failed_jobs:
        print(f"Failed jobs ({len(failed_jobs)}): {failed_jobs[:20]}")

    # 4. Write public/js/data/art_manifest.js
    payload = {
        "characters": dict(sorted(manifest_chars.items())),
        "variants": dict(sorted(manifest_variants.items())),
    }
    js_out = (
        "/**\n"
        " * Marvel Multiverse & Omnibus Atlas — Archived Local Collector Art Manifest\n"
        " * Generated by scripts/sync-collector-art.py — self-hosted under ./assets/art/\n"
        " */\n"
        "(function initMarvelArtManifest(root) {\n"
        "  'use strict';\n"
        f"  const MANIFEST = {json.dumps(payload, indent=2)};\n"
        "  if (typeof module !== 'undefined' && module.exports) {\n"
        "    module.exports = MANIFEST;\n"
        "  }\n"
        "  root.MARVEL_ART_MANIFEST = MANIFEST;\n"
        "})(typeof window !== 'undefined' ? window : globalThis);\n"
    )
    MANIFEST_JS.write_text(js_out, encoding="utf-8")

    # Summary stats
    total_bytes = sum(p.stat().st_size for p in ART_DIR.iterdir() if p.is_file())
    print(f"Manifest written to {MANIFEST_JS}")
    print(f"Total art files: {len(list(ART_DIR.iterdir()))}, total size: {total_bytes / (1024 * 1024):.2f} MB")

    still_missing = [c["id"] for c in chars if c["id"] not in manifest_chars]
    if still_missing:
        print(f"ERROR: Missing base character art for: {still_missing}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

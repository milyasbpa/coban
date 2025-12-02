#!/usr/bin/env python3
"""
Create comprehensive kanji grouping from extracted kanji data.
Groups based on: visual similarity, radicals, stroke count, and semantic themes.
"""

import json
from collections import defaultdict
from typing import Dict, List, Set

def load_kanji_data(filepath: str) -> List[Dict]:
    """Load and flatten all kanji from all levels."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_kanji = []
    for level in ['n5', 'n4', 'n3', 'n2']:
        for kanji in data.get(level, []):
            kanji['level'] = level.upper()
            all_kanji.append(kanji)
    
    return all_kanji

def create_visual_similarity_groups(kanji_list: List[Dict]) -> List[Dict]:
    """Create groups of visually similar kanji that are commonly confused."""
    # Define visual similarity groups based on common confusions
    similar_groups = [
        # Very similar looking kanji
        ['土', '士'],  # earth vs samurai
        ['末', '未'],  # end vs not yet
        ['人', '入'],  # person vs enter
        ['日', '目'],  # sun vs eye
        ['己', '已', '巳'],  # oneself variations
        ['刀', '力'],  # sword vs power
        ['大', '犬'],  # big vs dog
        ['太', '大'],  # fat vs big
        ['田', '由'],  # rice field vs reason
        ['右', '石'],  # right vs stone
        ['千', '干'],  # thousand vs dry
        ['夫', '天'],  # husband vs heaven
        ['王', '玉'],  # king vs jewel
        ['工', '土', '士'],  # construction, earth, samurai
        ['白', '自'],  # white vs self
        ['古', '吉'],  # old vs good luck
        ['未', '末'],  # not yet vs end
        ['牛', '午'],  # cow vs noon
        ['土', '王'],  # earth vs king
        ['木', '本'],  # tree vs origin
        ['口', '日'],  # mouth vs sun
        ['天', '夫'],  # heaven vs husband
        ['刀', '刃'],  # sword variations
        ['戸', '戸'],  # door
        ['矢', '失'],  # arrow vs lose
        ['欠', '次'],  # lack vs next
        ['令', '今'],  # order vs now
        ['台', '治'],  # platform vs govern
        ['冶', '治'],  # smelting vs govern
        ['辺', '辺'],  # area
        ['休', '体'],  # rest vs body
        ['代', '伐'],  # substitute vs fell
        ['住', '往'],  # dwell vs journey
        ['低', '底'],  # low vs bottom
        ['伝', '転'],  # transmit vs revolve
        ['茶', '荼'],  # tea
        ['芸', '芝'],  # art vs lawn
        ['陽', '場'],  # sunshine vs place
        ['階', '陛'],  # floor vs highness
        ['険', '検'],  # steep vs examine
        ['続', '統'],  # continue vs unite
        ['編', '偏'],  # compile vs partial
        ['遺', '違'],  # bequeath vs differ
        ['遠', '達'],  # far vs attain
        ['適', '敵'],  # suitable vs enemy
        ['増', '贈'],  # increase vs give
        ['衣', '農'],  # clothing vs agriculture (top part)
        ['祥', '詳'],  # auspicious vs detailed
        ['精', '清'],  # spirit vs pure
        ['晴', '清'],  # clear weather vs pure
    ]
    
    # Create character to level mapping
    char_map = {k['character']: k for k in kanji_list}
    
    groups = []
    for idx, similar_chars in enumerate(similar_groups, 1):
        items = []
        for char in similar_chars:
            if char in char_map:
                k = char_map[char]
                items.append({
                    'id': k['id'],
                    'character': k['character'],
                    'level': k['level']
                })
        
        if len(items) >= 2:  # Only include if we have at least 2 kanji
            groups.append({
                'id': f'visual_similar_{idx}',
                'name': f'Visually Similar: {" vs ".join(similar_chars)}',
                'type': 'visual_similarity',
                'items': items
            })
    
    return groups

def create_radical_groups(kanji_list: List[Dict]) -> List[Dict]:
    """Create groups based on common radicals."""
    
    # Define comprehensive radical groups
    radical_groups = {
        '氵_water': ['水', '汁', '江', '海', '洋', '河', '池', '湖', '泳', '流', '波', '泣', '油', '注', '法', '泊', '洗', '活', '浴', '消', '液', '深', '混', '清', '済', '漁', '満', '渡', '港', '湯', '温', '湿', '測', '減', '滴', '漢', '演', '潮', '激', '濃', '濯', '瀬'],
        '木_tree': ['木', '本', '林', '森', '村', '桜', '机', '材', '札', '朽', '杉', '李', '杏', '束', '東', '来', '松', '板', '果', '枚', '析', '枝', '栄', '柱', '某', '染', '柔', '査', '栽', '株', '核', '根', '格', '桃', '案', '桑', '梅', '械', '棒', '森', '棟', '植', '椅', '検', '業', '楽', '極', '標', '模', '権', '横', '樹', '橋', '機'],
        '言_speech': ['言', '話', '語', '読', '記', '説', '訳', '計', '訓', '託', '詞', '試', '詩', '認', '誌', '誓', '誕', '誤', '説', '誠', '誰', '課', '談', '請', '論', '諸', '謝', '警', '議', '護'],
        '亻_person': ['人', '何', '仕', '他', '付', '使', '便', '信', '休', '体', '住', '位', '低', '作', '例', '保', '係', '俳', '修', '借', '値', '倍', '候', '個', '倒', '借', '健', '側', '停', '偉', '備', '像', '僧', '億', '儀'],
        '手_扌_hand': ['手', '打', '持', '指', '授', '探', '投', '技', '折', '抜', '把', '抱', '抵', '押', '抽', '担', '拝', '拡', '拾', '挙', '挑', '振', '挿', '捕', '捜', '掃', '授', '掘', '接', '控', '推', '掲', '描', '提', '揺', '損', '摘', '撃', '操', '擁', '支', '攻', '放'],
        '心_忄_heart': ['心', '思', '忘', '忙', '快', '性', '悲', '情', '想', '意', '愛', '感', '態', '慣', '憶', '応', '志', '忠', '忽', '怖', '怒', '怠', '急', '恋', '恐', '恥', '恨', '恩', '恭', '息', '悩', '悦', '悪', '患', '悲', '惑', '惜', '惨', '慈', '慎', '慢', '慮', '慰', '憎', '懐', '懸', '憂'],
        '口_mouth': ['口', '名', '問', '叫', '吸', '吐', '味', '唱', '号', '告', '命', '和', '品', '員', '唯', '商', '善', '喜', '喫', '営', '嘆', '器', '嘱', '噴', '囲', '困', '可', '台', '史', '右', '司', '各', '合', '吉', '否', '含', '吹', '呈', '呉', '周', '呼', '呪', '味', '咲', '哀', '響'],
        '日_sun': ['日', '時', '曜', '明', '早', '昔', '昨', '昭', '映', '春', '昼', '暗', '暮', '暴', '暦', '晩', '普', '晴', '暇', '暑', '暖', '智', '景', '晶', '更', '書', '最', '曲', '曹', '替'],
        '門_gate': ['問', '間', '開', '閉', '閣', '閲', '闘'],
        '雨_rain': ['雨', '雪', '電', '雲', '雷', '震', '霊', '露', '霧', '需', '霜'],
        '食_飠_eat': ['食', '飲', '館', '飯', '飛', '養', '餓', '餌', '飾', '飽', '飼'],
        '車_car': ['車', '転', '軽', '輪', '軌', '軍', '軟', '輸', '輝', '載', '較', '輩'],
        '田_field': ['田', '男', '町', '界', '畑', '畜', '畔', '留', '略', '番', '異', '画', '畳', '疎', '畿'],
        '糸_糹_thread': ['糸', '紙', '紅', '級', '結', '終', '絵', '組', '経', '細', '紀', '約', '納', '純', '紛', '素', '索', '紫', '累', '紹', '絞', '統', '絶', '継', '続', '綿', '維', '綱', '網', '緊', '総', '緑', '線', '編', '緩', '練', '縁', '縄', '繁', '織', '繊', '繕', '繰'],
        '金_釒_metal': ['金', '銀', '鉄', '鉛', '銭', '針', '釣', '鋼', '鏡', '鉱', '鐘', '鋭', '録', '銃', '銅', '鋳', '錯', '錠', '錬', '鎖', '鎮'],
        '土_earth': ['土', '地', '場', '城', '域', '坂', '均', '垂', '型', '埋', '堂', '報', '堀', '堅', '堆', '塁', '塊', '塔', '塗', '塚', '塩', '填', '境', '墓', '増', '墜', '墨', '壁', '壇', '壊', '壌'],
        '女_woman': ['女', '好', '妻', '姉', '妹', '娘', '姿', '婚', '婦', '如', '妙', '妥', '姓', '委', '姫', '姻', '娠', '娯', '婆', '媛', '嫁', '嫌', '嬢'],
        '竹_bamboo': ['竹', '笑', '第', '等', '筆', '答', '策', '箱', '算', '管', '節', '範', '築', '簡', '籍', '符', '笛', '笹', '筋', '筒', '箸', '篤', '簿'],
        '宀_roof': ['安', '定', '家', '室', '客', '宮', '宿', '寄', '寒', '富', '寝', '察', '寛', '寧', '審', '宅', '宇', '守', '宗', '官', '宙', '宝', '実', '完', '宴', '宵', '寂', '寡', '寮', '寿'],
        '辶_road': ['道', '通', '進', '運', '近', '返', '速', '送', '追', '逃', '週', '連', '遠', '適', '選', '遅', '過', '達', '違', '遊', '迷', '退', '造', '迎', '辺', '迫', '逆', '逐', '透', '途', '逓', '逝', '逸', '遂', '遇', '遍', '遣', '遭', '遮', '遵', '遷', '遺'],
        '艹_grass': ['花', '草', '茶', '英', '若', '苦', '落', '薬', '葉', '芸', '荷', '菜', '菓', '著', '薄', '蓄', '蔵', '芋', '芝', '芳', '芽', '苗', '茂', '茎', '荒', '荘', '荻', '菊', '菌', '華', '萎', '葬', '葛', '蒸', '蒙', '蔑', '蔽', '蕉', '薦', '薪', '藤', '藩', '藻', '蘭'],
        '月_meat_moon': ['月', '明', '朝', '期', '有', '服', '朗', '望', '前', '肉', '肩', '背', '胸', '能', '脳', '腕', '腹', '腰', '脚', '脱', '肝', '股', '肌', '肪', '肥', '胃', '胆', '胎', '胞', '胴', '脂', '脅', '脈', '脊', '脚', '脳', '腎', '腐', '腫', '腸', '膜', '膚', '膨', '臓', '臨', '朋', '育'],
        '石_stone': ['石', '砂', '研', '破', '確', '砕', '硬', '硝', '硫', '碁', '碑', '磁', '礎', '礁', '礼'],
        '目_eye': ['目', '見', '相', '県', '真', '眼', '眠', '看', '直', '盲', '省', '眉', '眺', '督', '瞬', '瞭', '瞳', '矛', '盾', '盛', '盗'],
        '疒_sickness': ['病', '痛', '症', '療', '癌', '疲', '疾', '疫', '痴', '痕', '疑', '疎', '疹', '痘', '痩', '痢', '癒', '癖', '痺'],
        '立_stand': ['立', '音', '童', '意', '端', '競', '章', '站', '竜', '並', '親', '辛', '竟', '竣', '竪'],
        '方_direction': ['方', '放', '旅', '族', '施', '旋', '旗', '於', '施', '旺', '旧', '旦', '昨'],
        '攵_action': ['政', '教', '故', '救', '敗', '散', '敬', '数', '整', '敵', '敷', '文', '反', '収', '改', '攻', '放', '牧', '効', '務', '勉', '勢', '勤', '勧', '勲'],
        '力_power': ['力', '加', '助', '努', '励', '労', '効', '勇', '動', '勤', '務', '勝', '募', '勢', '勅', '勘', '勲', '勧', '勅'],
        '刀_刂_sword': ['刀', '刃', '切', '分', '列', '初', '利', '判', '別', '券', '制', '刷', '刻', '則', '削', '前', '剤', '剣', '剰', '割', '創', '劇', '剛', '剖', '剥'],
        '足_⻊_leg': ['足', '路', '踏', '跡', '跳', '距', '跨', '跡', '践', '踊', '蹴', '躍', '躊', '蹟', '蹄', '躇', '蹂'],
        '走_run': ['走', '赤', '起', '超', '越', '趣', '趨', '赴', '赳', '赴'],
        '見_see': ['見', '視', '規', '覚', '観', '親', '覧', '覗', '覆', '覇'],
        '貝_shell': ['貝', '買', '貨', '販', '貯', '費', '貧', '貴', '貿', '賀', '資', '賃', '賄', '賊', '賓', '賛', '賜', '賞', '賠', '賢', '賦', '質', '賭', '購', '贈', '贋'],
        '⻗_town': ['都', '部', '郡', '郊', '郎', '郵', '郷', '酋', '酌', '配', '酒', '酔', '酢', '酪', '酬', '酵', '酷', '酸', '酬', '醜', '醒', '醸', '釈'],
        '馬_horse': ['馬', '駅', '駆', '駐', '騎', '験', '騒', '騰', '驚', '骨', '骸', '髄'],
        '犬_犭_dog': ['犬', '猫', '献', '状', '猛', '独', '狭', '狂', '狙', '狩', '猟', '獄', '獣', '獲'],
        '鳥_bird': ['鳥', '鳴', '鶏', '鴨', '鶴', '鷹', '鵬', '鷺'],
        '魚_fish': ['魚', '鮮', '鯨', '鮎', '鯉', '鮭', '鯛', '漁', '鱈', '鰻'],
        '虫_insect': ['虫', '蚊', '蛇', '蛍', '蛙', '蝶', '蜂', '蝉', '螺', '蟹', '蛮', '触', '融', '蜜', '蚕', '蛍'],
        '牛_cow': ['牛', '物', '特', '犠', '牧', '牲', '牽', '犯', '告'],
        '大_big': ['大', '太', '夫', '央', '失', '奇', '奈', '奏', '契', '奔', '套', '奥', '奨', '奪', '奮', '奇'],
        '小_small': ['小', '少', '尖', '尚', '劣', '省', '光', '当', '尝', '尝', '尝'],
        '寸_inch': ['寸', '対', '専', '射', '将', '尊', '導', '封', '尉', '尋', '尺', '尻', '尼', '尽'],
        '工_craft': ['工', '左', '巧', '功', '差', '巨', '巫', '項', '貢', '攻', '江', '紅', '空', '虹', '虹'],
        '广_shelter': ['店', '度', '庁', '座', '庫', '庭', '康', '府', '庄', '床', '序', '底', '店', '庚', '庶', '庸', '廃', '廉', '廊', '廓', '廟', '廠'],
        '弓_bow': ['引', '弟', '弱', '張', '強', '弾', '弦', '弧', '弥', '弘', '弼', '彊'],
        '彳_step': ['行', '待', '後', '律', '従', '得', '御', '復', '徒', '径', '徐', '徴', '徳', '徹', '徴', '微', '徴', '徴', '衛', '衝', '衡', '街', '衰', '衷'],
        '山_mountain': ['山', '岩', '岸', '島', '峰', '崩', '岳', '峠', '峡', '崎', '崇', '崖', '嵐', '嶺', '岐', '岡', '岬', '岱', '岨', '峨', '峙', '峻', '峪', '峭', '崔'],
        '川_river': ['川', '州', '巡', '巣', '順', '災', '巡'],
        '己_oneself': ['己', '改', '記', '起', '忌', '紀', '配'],
        '巾_cloth': ['市', '布', '帯', '席', '常', '帆', '希', '師', '帝', '帽', '幅', '幕', '幣', '幹', '幾', '幻', '幼', '帳', '帥', '帰', '帯'],
        '一_one': ['一', '二', '三', '示', '元', '万', '丈', '上', '下', '天', '不', '丙', '世', '丘', '並', '丞', '両', '並', '凶'],
        '示_礻_altar': ['社', '神', '礼', '祭', '票', '祈', '祉', '祐', '祖', '祝', '祥', '禁', '禄', '禅', '禍', '福', '祈', '祷', '禎', '禦', '禧', '禰'],
        '衣_衤_clothes': ['衣', '表', '裏', '被', '初', '裁', '製', '補', '装', '裕', '裂', '衰', '袋', '袖', '被', '裸', '裾', '褐', '褒', '褪', '襟', '襲'],
        '欠_lack': ['欠', '次', '欧', '欲', '欺', '欽', '款', '歌', '歓', '歎', '欣'],
        '止_stop': ['止', '正', '歩', '武', '歴', '歳', '歯', '歪', '死', '殉', '殊', '残', '殖', '殺', '殻', '殿', '段', '殴'],
        '王_king': ['王', '玉', '宝', '珠', '現', '理', '球', '班', '琴', '琢', '瑞', '璃', '璧', '環', '玲', '瑛', '瑚', '瑠', '璽'],
        '耳_ear': ['取', '聞', '職', '聖', '聴', '聡', '聯', '聯', '聰', '聨', '聲', '聴', '聲', '聯'],
        '戸_door': ['戸', '所', '房', '扇', '肩', '扁', '扉', '扇'],
        '火_灬_fire': ['火', '炎', '焼', '煙', '然', '照', '熱', '燃', '燥', '灯', '災', '炉', '炊', '炭', '点', '為', '焦', '無', '煮', '煩', '煎', '煙', '煌', '照', '煽', '熊', '熟', '熱', '燈', '燐', '燕', '爆', '爛'],
        '禾_grain': ['私', '秋', '科', '秒', '種', '稲', '秘', '和', '税', '移', '程', '称', '穀', '穂', '秀', '季', '委', '香', '秩', '穏', '穫', '稿', '稼', '稽', '稚', '稜', '穀'],
        '白_white': ['白', '百', '的', '皇', '皆', '皮', '皿', '泉', '皆', '皐', '皓', '皙', '皚'],
        '矢_arrow': ['矢', '知', '短', '矯', '医', '族', '矩', '矮'],
        '网_罒_net': ['買', '置', '罪', '署', '罰', '罵', '罷', '羅', '罠', '罫', '罷'],
        '羊_sheep': ['羊', '美', '養', '様', '義', '儀', '洋', '鮮', '羨', '群', '羚', '羞', '羔', '羯', '羲'],
        '羽_feather': ['羽', '習', '翌', '翔', '翁', '翠', '翻', '翼', '翰', '翳'],
        '老_old': ['老', '考', '者', '孝', '耕', '耗', '耐', '耆'],
        '而_rake': ['而', '耐', '需', '儒', '濡', '懦'],
        '耒_plow': ['耕', '耘', '耙', '耜'],
        '聿_brush': ['書', '筆', '建', '律', '肆'],
        '肉_meat': ['肉', '育', '肌', '肝', '股', '肢', '肥'],
        '臣_retainer': ['臣', '臨', '臥', '臓', '臧'],
        '自_self': ['自', '臭', '息', '鼻', '嗅'],
        '至_arrive': ['至', '到', '室', '致', '臻', '屋', '握'],
        '臼_mortar': ['臼', '興', '舅', '舂', '舊'],
        '舌_tongue': ['舌', '話', '活', '乱', '括', '舐'],
        '舛_oppose': ['舛', '舞', '舜', '舛'],
        '舟_boat': ['船', '般', '航', '舶', '舵', '艦', '艇', '艘', '艙', '艘'],
        '艮_stubborn': ['艮', '根', '限', '良', '銀', '退', '墾', '恨', '懇', '琅', '狼', '痕', '很', '眼', '跟', '限', '銀', '齦'],
        '色_color': ['色', '絶', '艶', '艷'],
        '虍_tiger': ['虎', '虐', '虚', '虜', '虞', '虧', '虔'],
        '血_blood': ['血', '衆', '皿', '盟'],
        '行_go': ['行', '術', '街', '衝', '衛', '衡'],
        '角_horn': ['角', '解', '触', '觸'],
        '言_speech2': ['訂', '討', '訓', '記', '訪', '設', '許', '訴'],
        '谷_valley': ['谷', '容', '俗', '浴', '欲', '裕', '豁', '豊', '谺', '谿'],
        '豆_bean': ['豆', '短', '頭', '豊', '豈', '豌', '豎', '豐', '豔', '豚', '象'],
        '豕_pig': ['豕', '家', '象', '豪', '豫', '豬', '豸'],
        '身_body': ['身', '射', '躬', '躯', '躱'],
        '酉_alcohol': ['酉', '酒', '酔', '酵', '酌', '酢', '酪', '酬', '酷', '酸', '酬', '醜', '醒', '醸', '配', '酋'],
        '里_village': ['里', '野', '重', '量', '理', '埋', '釐'],
        '門_gate2': ['門', '開', '閉', '聞', '間', '閲', '闘', '問'],
        '隹_bird2': ['隹', '集', '進', '推', '難', '雑', '離', '雛', '雀', '雇', '售', '雉', '雙'],
    }
    
    char_map = {k['character']: k for k in kanji_list}
    groups = []
    
    for radical_id, chars in radical_groups.items():
        items = []
        for char in chars:
            if char in char_map:
                k = char_map[char]
                items.append({
                    'id': k['id'],
                    'character': k['character'],
                    'level': k['level']
                })
        
        if items:  # Only include if we found at least one kanji
            radical_name = radical_id.split('_', 1)[-1].title()
            groups.append({
                'id': f'radical_{radical_id}',
                'name': f'Radical: {radical_name}',
                'type': 'radical',
                'items': items
            })
    
    return groups

def create_stroke_count_groups(kanji_list: List[Dict]) -> List[Dict]:
    """Create groups based on stroke count."""
    stroke_groups = defaultdict(list)
    
    for kanji in kanji_list:
        strokes = kanji.get('strokes', 0)
        stroke_groups[strokes].append({
            'id': kanji['id'],
            'character': kanji['character'],
            'level': kanji['level']
        })
    
    groups = []
    for stroke_count in sorted(stroke_groups.keys()):
        items = sorted(stroke_groups[stroke_count], key=lambda x: x['id'])
        groups.append({
            'id': f'strokes_{stroke_count}',
            'name': f'{stroke_count} Strokes',
            'type': 'stroke_count',
            'items': items
        })
    
    return groups

def create_semantic_groups(kanji_list: List[Dict]) -> List[Dict]:
    """Create semantic/thematic groups."""
    
    semantic_groups = {
        'numbers': {
            'name': 'Numbers',
            'chars': ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '億', '兆', '零']
        },
        'time': {
            'name': 'Time',
            'chars': ['日', '月', '年', '時', '分', '秒', '今', '昔', '朝', '夜', '午', '昼', '夕', '暮', '週', '毎', '常', '永', '久', '期', '季', '暦', '明', '暗']
        },
        'family': {
            'name': 'Family',
            'chars': ['父', '母', '兄', '姉', '弟', '妹', '子', '孫', '親', '祖', '族', '夫', '妻', '嫁', '婿', '叔', '伯']
        },
        'directions': {
            'name': 'Directions',
            'chars': ['東', '西', '南', '北', '上', '下', '左', '右', '前', '後', '中', '外', '内', '裏', '表', '側', '横', '縦', '辺', '央']
        },
        'colors': {
            'name': 'Colors',
            'chars': ['白', '黒', '赤', '青', '黄', '緑', '色', '紫', '茶', '銀', '金', '灰']
        },
        'body_parts': {
            'name': 'Body Parts',
            'chars': ['手', '足', '目', '口', '耳', '鼻', '頭', '体', '心', '首', '顔', '腕', '指', '背', '腰', '腹', '胸', '肩', '膝', '骨', '肉', '皮', '血', '髪', '歯', '舌', '喉', '脳', '肝']
        },
        'nature': {
            'name': 'Nature',
            'chars': ['山', '川', '海', '空', '雨', '雪', '風', '花', '木', '林', '森', '石', '岩', '土', '池', '湖', '河', '島', '谷', '野', '草', '葉', '桜', '松', '竹', '梅', '波', '雲', '雷', '星', '月', '日', '光', '火', '水', '氷', '霧', '露', '霜']
        },
        'school_education': {
            'name': 'School & Education',
            'chars': ['学', '校', '教', '勉', '試', '験', '習', '授', '課', '科', '宿', '題', '研', '究', '室', '級', '師', '生', '先', '児', '童', '育', '講', '義', '読', '書', '算', '数', '理']
        },
        'country_place': {
            'name': 'Country & Place',
            'chars': ['国', '県', '市', '町', '村', '都', '京', '区', '州', '府', '郡', '郷', '所', '地', '場', '域', '界', '境', '際', '辺']
        },
        'buildings': {
            'name': 'Buildings',
            'chars': ['家', '店', '館', '院', '寺', '社', '宮', '城', '宿', '屋', '堂', '塔', '門', '橋', '道', '駅', '港', '園', '場', '庁', '庭', '室', '棟', '階']
        },
        'verbs_movement': {
            'name': 'Movement Verbs',
            'chars': ['行', '来', '帰', '入', '出', '走', '歩', '立', '座', '止', '動', '進', '退', '返', '通', '送', '運', '渡', '越', '登', '降', '昇', '落', '飛', '泳', '乗', '転', '回', '流', '追', '逃', '速', '遅', '急', '遠', '近']
        },
        'verbs_action': {
            'name': 'Action Verbs',
            'chars': ['見', '聞', '言', '話', '読', '書', '食', '飲', '作', '造', '使', '持', '取', '切', '打', '押', '引', '開', '閉', '始', '終', '買', '売', '借', '貸', '教', '習', '思', '考', '知', '忘', '覚', '信', '感', '待', '休', '働', '遊', '笑', '泣', '怒', '着', '脱', '寝', '起', '洗', '浴']
        },
        'adjectives': {
            'name': 'Adjectives',
            'chars': ['大', '小', '高', '低', '長', '短', '太', '細', '厚', '薄', '広', '狭', '深', '浅', '強', '弱', '多', '少', '新', '古', '若', '老', '良', '悪', '美', '醜', '正', '誤', '真', '偽', '明', '暗', '軽', '重', '速', '遅', '早', '晩', '暖', '寒', '暑', '涼', '熱', '冷', '温', '甘', '辛', '苦', '酸', '堅', '軟', '固', '易', '難', '険', '平', '急', '緩', '静', '賑']
        },
        'animals': {
            'name': 'Animals',
            'chars': ['犬', '猫', '馬', '牛', '豚', '羊', '鳥', '魚', '虫', '蛇', '亀', '象', '猿', '鹿', '熊', '虎', '狼', '兎', '鼠', '竜', '龍', '蛙', '蝶', '蜂', '蚊', '蟹']
        },
        'plants': {
            'name': 'Plants',
            'chars': ['木', '林', '森', '花', '草', '葉', '枝', '根', '実', '種', '米', '麦', '豆', '芋', '茶', '菜', '果', '桜', '梅', '松', '竹', '菊', '蘭', '藤']
        },
        'food_drink': {
            'name': 'Food & Drink',
            'chars': ['食', '飲', '飯', '肉', '魚', '卵', '油', '塩', '砂', '糖', '酒', '茶', '水', '湯', '味', '料', '菓', '果', '野', '菜', '米', '麦', '麺', '粉', '乳']
        },
        'weather': {
            'name': 'Weather',
            'chars': ['天', '気', '晴', '雨', '雪', '雲', '風', '雷', '霧', '霜', '露', '氷', '暑', '寒', '暖', '涼', '温', '湿', '乾', '曇']
        },
        'emotions': {
            'name': 'Emotions & Feelings',
            'chars': ['喜', '怒', '哀', '楽', '愛', '恋', '恐', '怖', '悲', '哭', '笑', '泣', '嬉', '楽', '幸', '福', '悩', '苦', '痛', '憂', '慰', '感', '情', '快', '不', '快', '興', '奮', '激', '緊', '張', '安', '心', '驚', '慌']
        },
        'quantities': {
            'name': 'Quantities & Amounts',
            'chars': ['全', '半', '数', '多', '少', '増', '減', '倍', '割', '余', '欠', '満', '空', '足', '約', '程', '等', '均', '平', '過', '超']
        },
        'government_society': {
            'name': 'Government & Society',
            'chars': ['国', '政', '府', '省', '庁', '官', '公', '民', '法', '律', '令', '規', '則', '制', '税', '警', '察', '裁', '判', '罪', '罰', '選', '挙', '投', '票', '党', '議', '会', '員', '代', '表', '王', '皇', '帝', '臣', '主', '君']
        },
        'business_economy': {
            'name': 'Business & Economy',
            'chars': ['会', '社', '業', '企', '商', '売', '買', '貿', '易', '店', '品', '価', '値', '格', '金', '銭', '貨', '幣', '円', '銀', '行', '財', '産', '資', '費', '用', '税', '益', '損', '得', '利', '益', '職', '労', '働', '給', '料', '収', '支', '払', '経', '営', '営', '務', '額']
        },
        'communication': {
            'name': 'Communication',
            'chars': ['言', '話', '語', '読', '書', '記', '聞', '問', '答', '説', '論', '議', '談', '伝', '達', '告', '知', '報', '信', '訳', '訓', '呼', '叫', '声', '音', '響', '電', '話', '字', '文', '句', '章', '文']
        },
        'materials': {
            'name': 'Materials',
            'chars': ['金', '銀', '銅', '鉄', '鋼', '石', '岩', '木', '材', '紙', '布', '糸', '綿', '絹', '革', '皮', '土', '泥', '砂', '陶', '磁', '器', '硝', '子', '油', '炭', '薬', '毒']
        },
        'abstract_concepts': {
            'name': 'Abstract Concepts',
            'chars': ['事', '物', '者', '人', '方', '様', '種', '類', '形', '状', '態', '度', '性', '質', '格', '相', '体', '面', '点', '部', '分', '全', '体', '個', '別', '共', '通', '同', '異', '各', '他']
        },
        'science_technology': {
            'name': 'Science & Technology',
            'chars': ['科', '学', '理', '化', '物', '理', '生', '物', '数', '学', '算', '計', '技', '術', '工', '学', '医', '薬', '電', '気', '機', '械', '器', '具', '発', '明', '実', '験', '研', '究', '測', '定', '観', '察']
        },
        'transport': {
            'name': 'Transportation',
            'chars': ['車', '自', '動', '電', '車', '列', '車', '汽', '車', '船', '飛', '行', '機', '駅', '港', '空', '港', '道', '路', '線', '橋', '乗', '降', '運', '転', '輸', '送', '通']
        },
        'positions': {
            'name': 'Positions & Ranks',
            'chars': ['王', '皇', '帝', '君', '主', '長', '官', '社', '長', '会', '長', '議', '長', '委', '員', '長', '部', '長', '課', '長', '係', '長', '班', '長', '組', '長', '首', '相', '大', '臣', '将', '軍', '師', '範']
        }
    }
    
    char_map = {k['character']: k for k in kanji_list}
    groups = []
    
    for group_id, group_data in semantic_groups.items():
        items = []
        for char in group_data['chars']:
            if char in char_map:
                k = char_map[char]
                items.append({
                    'id': k['id'],
                    'character': k['character'],
                    'level': k['level']
                })
        
        if items:  # Only include if we found at least one kanji
            groups.append({
                'id': f'semantic_{group_id}',
                'name': f'Theme: {group_data["name"]}',
                'type': 'semantic',
                'items': items
            })
    
    return groups

def create_level_groups(kanji_list: List[Dict]) -> List[Dict]:
    """Create groups by JLPT level."""
    level_groups = defaultdict(list)
    
    for kanji in kanji_list:
        level = kanji.get('level', 'Unknown')
        level_groups[level].append({
            'id': kanji['id'],
            'character': kanji['character'],
            'level': kanji['level']
        })
    
    groups = []
    for level in ['N5', 'N4', 'N3', 'N2']:
        if level in level_groups:
            items = sorted(level_groups[level], key=lambda x: x['id'])
            groups.append({
                'id': f'level_{level.lower()}',
                'name': f'JLPT {level}',
                'type': 'jlpt_level',
                'items': items
            })
    
    return groups

def main():
    """Main function to create comprehensive kanji grouping."""
    print("Loading kanji data...")
    kanji_list = load_kanji_data('/Users/ilyasbashirah/Documents/kerja/bas.co/coban/temp_kanji.json')
    print(f"Loaded {len(kanji_list)} kanji")
    
    all_groups = []
    
    print("\nCreating visual similarity groups...")
    visual_groups = create_visual_similarity_groups(kanji_list)
    all_groups.extend(visual_groups)
    print(f"Created {len(visual_groups)} visual similarity groups")
    
    print("\nCreating radical groups...")
    radical_groups = create_radical_groups(kanji_list)
    all_groups.extend(radical_groups)
    print(f"Created {len(radical_groups)} radical groups")
    
    print("\nCreating stroke count groups...")
    stroke_groups = create_stroke_count_groups(kanji_list)
    all_groups.extend(stroke_groups)
    print(f"Created {len(stroke_groups)} stroke count groups")
    
    print("\nCreating semantic/thematic groups...")
    semantic_groups = create_semantic_groups(kanji_list)
    all_groups.extend(semantic_groups)
    print(f"Created {len(semantic_groups)} semantic groups")
    
    print("\nCreating JLPT level groups...")
    level_groups = create_level_groups(kanji_list)
    all_groups.extend(level_groups)
    print(f"Created {len(level_groups)} level groups")
    
    # Create final output
    output = {
        'version': '1.0',
        'total_kanji': len(kanji_list),
        'total_groups': len(all_groups),
        'generated_date': '2024-12-02',
        'groups': all_groups
    }
    
    # Save to file
    output_path = '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/kanji-similar-groups.json'
    print(f"\nSaving to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    # Calculate coverage statistics
    all_kanji_in_groups = set()
    for group in all_groups:
        for item in group['items']:
            all_kanji_in_groups.add(item['character'])
    
    coverage = len(all_kanji_in_groups)
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total kanji: {len(kanji_list)}")
    print(f"Total groups created: {len(all_groups)}")
    print(f"  - Visual similarity: {len(visual_groups)}")
    print(f"  - Radical groups: {len(radical_groups)}")
    print(f"  - Stroke count: {len(stroke_groups)}")
    print(f"  - Semantic themes: {len(semantic_groups)}")
    print(f"  - JLPT levels: {len(level_groups)}")
    print(f"Kanji coverage: {coverage}/{len(kanji_list)} ({coverage/len(kanji_list)*100:.1f}%)")
    print(f"{'='*60}")
    print(f"\nFile saved successfully!")

if __name__ == '__main__':
    main()

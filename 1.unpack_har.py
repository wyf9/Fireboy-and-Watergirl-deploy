import json
import base64
import os
from os import path
import common  # 确保你已经创建了刚才说的那个 common.py

# 游戏列表
games = ['A', 'B', 'C', 'D', 'E', 'F']

def process_game(game_code):
    # 全部从 common 统一获取路径，避免手动写死 URL
    grab_url_base = common.get_grab_url(game_code) 
    har_path = f"{common.har_dir}/{game_code}.har"
    output_json = common.get_resource_list_path(game_code)
    
    if not path.exists(har_path):
        print(f"跳过 {game_code}: 找不到文件 {har_path}")
        return

    print(f"正在处理游戏 {game_code}...")
    
    try:
        with open(har_path, 'r', encoding='utf-8') as f:
            har_data = json.load(f)
    except Exception as e:
        print(f"读取 {game_code} 出错: {e}")
        return

    har_entries = har_data['log']['entries']
    resource_list = {'resources': [], 'levels': []}
    hash_list = {}

    def push_levels(temple_data):
        for item in temple_data['levels']:
            resource_list['levels'].append('data/' + item['filename'])

    for entry in har_entries:
        url: str = entry['request']['url']
        
        if url.startswith(grab_url_base):
            clean_url = url[len(grab_url_base):]
            if '?' in clean_url:
                clean_url = clean_url.split('?')[0]
            
            if not hash_list.get(clean_url):
                hash_list[clean_url] = True
                if '/levels/' not in clean_url:
                    resource_list['resources'].append(clean_url)

        if '/temple.json' in url:
            try:
                content = entry['response']['content']
                text = content.get('text', '')
                if content.get('encoding') == 'base64':
                    text = base64.b64decode(text).decode('utf-8')
                
                temple_json = json.loads(text)
                push_levels(temple_json)
            except:
                print(f"警告: 解析 {game_code} 的 temple.json 失败")

    # 自动创建 data/A, data/B 等目录
    os.makedirs(path.dirname(output_json), exist_ok=True)
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(resource_list, f, indent='  ')
    print(f"成功导出 {game_code} 的清单到 {output_json}")

# 执行循环
for g in games:
    process_game(g)
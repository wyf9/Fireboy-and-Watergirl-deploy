import json
import common
import os
from urllib.request import urlopen
from urllib.request import HTTPError
from os import path

# 游戏列表
games = ['A', 'B', 'C', 'D', 'E', 'F']

def grab_game_resources(game_code):
    # 动态获取当前游戏的配置
    resource_list_path = common.get_resource_list_path(game_code)
    grab_url_base = common.get_grab_url(game_code)
    # 每个游戏放在独立的输出文件夹，例如 output/A
    game_output_dir = path.join("output", game_code)

    if not path.exists(resource_list_path):
        print(f"跳过 {game_code}: 找不到清单文件 {resource_list_path}")
        return

    print(f"\n======= 正在下载游戏 {game_code} 的资源 =======")
    
    with open(resource_list_path, 'r', encoding='utf-8') as f:
        resource_list = json.load(f)

    def grab_file(relative_url):
        print(f"[{game_code}] 下载: {relative_url}")
        url = grab_url_base + relative_url
        save_path = path.join(game_output_dir, relative_url)
        
        os.makedirs(path.dirname(save_path), exist_ok=True)
        
        try:
            # 如果文件已经存在，可以跳过（节省时间）
            if path.exists(save_path):
                # print(f"    跳过已存在的文件")
                return
                
            data = urlopen(url).read()
            with open(save_path, 'wb') as f:
                f.write(data)
        except HTTPError as err:
            print(f"    错误 {err.code}: {relative_url}")
        except Exception as e:
            print(f"    发生异常: {e}")

    # 创建该游戏的根目录
    os.makedirs(game_output_dir, exist_ok=True)

    # 下载普通资源
    for url in resource_list['resources']:
        grab_file(url)

    # 下载关卡数据
    for url in resource_list['levels']:
        grab_file(url)

# 循环执行所有游戏的下载
for g in games:
    grab_game_resources(g)

print("\n所有任务已完成！请查看 output 文件夹。")
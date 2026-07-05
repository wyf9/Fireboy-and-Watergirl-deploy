# common.py

# 基础 URL 模板，{} 会被替换为 A, B, C, D, E, F
grab_url_template = "https://apps.ak-ioi.com/fireboy-and-watergirl/{}/dist/"

# HAR 文件存放的基础目录
har_dir = "./har"

# 数据输出的基础目录
data_dir = "./data"

# 获取特定游戏的资源列表路径
def get_resource_list_path(game_code):
    return f"{data_dir}/{game_code}/resource-list.json"

# 获取特定游戏的抓取 URL
def get_grab_url(game_code):
    return grab_url_template.format(game_code)
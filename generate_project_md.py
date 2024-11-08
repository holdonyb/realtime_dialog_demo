import os
import subprocess
from collections import defaultdict

def get_tracked_files():
    """获取Git仓库中所有被追踪的文件列表"""
    try:
        result = subprocess.run(['git', 'ls-files'], stdout=subprocess.PIPE, text=True, check=True)
        files = result.stdout.strip().split('\n')
        return files
    except subprocess.CalledProcessError as e:
        print("Error executing git command:", e)
        return []
    
def get_all_files():
    """获取项目目录下的所有文件（包括未被Git追踪的文件）"""
    files = []
    return [os.path.join(root, file) 
            for root, _, files in os.walk('.')
            for file in files]

def build_tree(file_paths):
    """将文件路径列表转换为树形结构的字典
    Args:
        file_paths: 文件路径列表
    Returns:
        dict: 表示文件树的嵌套字典
    """
    tree = {}
    for path in file_paths:
        parts = path.split('/')
        current = tree
        for part in parts:
            if part not in current:
                current[part] = {}
            current = current[part]
    return tree

def print_tree(tree, prefix=''):
    """将树形结构转换为ASCII树形图
    Args:
        tree: 树形结构字典
        prefix: 当前行的前缀字符串
    Returns:
        list: ASCII树形图的行列表
    """
    tree_lines = []
    for i, (name, subtree) in enumerate(sorted(tree.items())):
        connector = '└── ' if i == len(tree) - 1 else '├── '  # 选择适当的连接符
        tree_lines.append(f"{prefix}{connector}{name}")
        if subtree:
            extension = '    ' if i == len(tree) - 1 else '│   '  # 为子树选择适当的缩进
            tree_lines.extend(print_tree(subtree, prefix + extension))
    return tree_lines

def generate_markdown(tree, files):
    """生成包含项目结构和文件内容的Markdown文档
    Args:
        tree: 文件树字典
        files: 文件路径列表
    Returns:
        str: 生成的Markdown内容
    """
    md_lines = []
    md_lines.append("# 项目文件结构\n")
    tree_lines = print_tree(tree)
    md_lines.extend(tree_lines)
    md_lines.append("\n\n# 文件内容\n")

    for file in files:
        md_lines.append(f"## `{file}`\n")
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            file_extension = os.path.splitext(file)[1][1:] or 'plaintext'  # 获取文件扩展名，默认为plaintext
            md_lines.append(f"```{file_extension}\n{content}\n```\n")
        except Exception as e:
            md_lines.append(f"无法读取文件内容: {e}\n")
    
    return '\n'.join(md_lines)

def main():
    files = get_tracked_files()
    tree = build_tree(files)
    markdown_content = generate_markdown(tree, files)
    with open('project_structure.md', 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print("Markdown文件已生成：project_structure.md")

if __name__ == "__main__":
    main()
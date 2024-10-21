import os
import subprocess
from collections import defaultdict

def get_tracked_files():
    try:
        result = subprocess.run(['git', 'ls-files'], stdout=subprocess.PIPE, text=True, check=True)
        files = result.stdout.strip().split('\n')
        return files
    except subprocess.CalledProcessError as e:
        print("Error executing git command:", e)
        return []

def build_tree(file_paths):
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
    tree_lines = []
    for i, (name, subtree) in enumerate(sorted(tree.items())):
        connector = '└── ' if i == len(tree) - 1 else '├── '
        tree_lines.append(f"{prefix}{connector}{name}")
        if subtree:
            extension = '    ' if i == len(tree) - 1 else '│   '
            tree_lines.extend(print_tree(subtree, prefix + extension))
    return tree_lines

def generate_markdown(tree, files):
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
            file_extension = os.path.splitext(file)[1][1:] or 'plaintext'
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
#!/usr/bin/env python3
"""
Book Factory Dashboard Updater
Updates the dashboard HTML with current chapter stats AND embeds chapter content.
"""
import os
import re
import subprocess
from pathlib import Path
from datetime import datetime

WORKSPACE = Path.home() / ".openclaw/workspace/book-writing"
TERMS_DIR = WORKSPACE / "terms-of-survival-v2"
CHAPTERS_DIR = TERMS_DIR / "chapters"
DEPLOYED_HTML = Path.home() / ".openclaw/workspace/projects/percy-book-factory/index.html"

def count_chapters_and_words():
    """Count existing chapters and total words."""
    chapters = []
    total_words = 0
    
    for i in range(1, 51):
        ch_file = CHAPTERS_DIR / f"chapter-{i:02d}.md"
        if ch_file.exists():
            content = ch_file.read_text()
            if "[Coming soon" in content or "[IN PROGRESS]" in content:
                continue
            words = len(content.split())
            chapters.append((i, words))
            total_words += words
    
    return len(chapters), total_words

def load_chapters_json():
    """Load all chapter content into JavaScript object."""
    chapters_data = {}
    
    for i in range(1, 51):
        ch_file = CHAPTERS_DIR / f"chapter-{i:02d}.md"
        if ch_file.exists():
            content = ch_file.read_text()
            # Skip placeholders
            if "[Coming soon" in content or "[IN PROGRESS]" in content:
                continue
            
            # Get title from first line (either # Chapter X: or first line)
            lines = content.strip().split('\n')
            title = f"Chapter {i}"
            for line in lines:
                if line.startswith('# Chapter'):
                    title = line.lstrip('# ').strip()
                    break
            
            # Escape backticks and special chars for JS
            content_escaped = content.replace('`', '\\`').replace('${', '\\${')
            
            chapters_data[i] = {
                'title': title,
                'content': content_escaped
            }
    
    return chapters_data

def update_dashboard():
    """Update the HTML dashboard with current stats and chapter content."""
    num_chapters, total_words = count_chapters_and_words()
    chapters_data = load_chapters_json()
    
    print(f"Found {num_chapters} chapters, ~{total_words} words")
    
    if not DEPLOYED_HTML.exists():
        print(f"Deployed dashboard not found at {DEPLOYED_HTML}")
        return
    
    html = DEPLOYED_HTML.read_text()
    
    # Update the chapters written stat
    html = re.sub(
        r'<div class="stat-card">\s*<div class="number">(\d+)</div>\s*<div class="label">Chapters Written</div>',
        f'<div class="stat-card">\n            <div class="number">{num_chapters}</div>\n            <div class="label">Chapters Written</div>',
        html
    )
    
    # Update the words stat
    html = re.sub(
        r'<div class="stat-card">\ class="number">s*<div~?(\d+(?:,\d+)?)</div>\s*<div class="label">Words</div>',
        f'<div class="stat-card">\n            <div class="number">~{total_words:,}</div>\n            <div class="label">Words</div>',
        html
    )
    
    # Update last modified
    now = datetime.now().strftime("%B %d, %Y")
    html = re.sub(
        r'Last updated: [^|]+',
        f'Last updated: {now}',
        html
    )
    
    # Replace the chapters JavaScript object
    js_chapters = "const chapters = {\n"
    for num, data in sorted(chapters_data.items()):
        js_chapters += f"            {num}: {{\n                title: \"{data['title']}\",\n                content: `{data['content']}`\n            }},\n"
    js_chapters += "        };"
    
    # Find and replace the chapters object
    html = re.sub(
        r'const chapters = \{[^}]+\};',
        js_chapters,
        html,
        flags=re.DOTALL
    )
    
    # Update chapter buttons
    button_html = ""
    for i in range(1, num_chapters + 1):
        button_html += f'<button class="chapter-btn" onclick="showChapter({i})">{i}</button>'
    
    html = re.sub(
        r'<div class="chapter-buttons">.*?</div>',
        f'<div class="chapter-buttons">{button_html}</div>',
        html,
        flags=re.DOTALL
    )
    
    DEPLOYED_HTML.write_text(html)
    print(f"Dashboard updated: {num_chapters} chapters, ~{total_words:,} words")
    
    # Push to GitHub
    try:
        repo_dir = DEPLOYED_HTML.parent
        subprocess.run(["git", "add", "-A"], cwd=repo_dir, check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", f"Dashboard: {num_chapters} chapters, ~{total_words:,} words"], cwd=repo_dir, check=True, capture_output=True)
        subprocess.run(["git", "push"], cwd=repo_dir, check=True, capture_output=True)
        print("Pushed to GitHub")
    except subprocess.CalledProcessError as e:
        print(f"Git push failed: {e}")

if __name__ == "__main__":
    update_dashboard()

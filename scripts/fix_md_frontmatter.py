import glob, re

md_files = glob.glob('sessions/**/*.md', recursive=True) + glob.glob('fr/**/*.md', recursive=True) + glob.glob('ru/**/*.md', recursive=True)
print(f"Scanning {len(md_files)} markdown files...")

fixed_count = 0

for filepath in md_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if 'round_2:' is indented under lets_speak_together or note
    # Pattern: lets_speak_together:\n  title: ...\n  note: |-\n    <div class="lst-grid"...
    # and round_2: follows inside the indented block without proper YAML separation

    if 'lets_speak_together:' in content and 'round_2:' in content:
        # Match from lets_speak_together down to round_2
        pattern = r'(lets_speak_together:\s*\n(?:\s+.*\n)*?)(\s*round_2:)'
        match = re.search(pattern, content)
        if match:
            lst_block = match.group(1)
            # Check if round_2 was captured inside the multiline note
            if 'note: |' in lst_block or 'note: |-' in lst_block:
                # We need to ensure the HTML inside note is properly closed or truncated before round_2 begins
                # Let's inspect what's inside lst_block
                lines = lst_block.splitlines()
                new_lines = []
                in_note = False
                for line in lines:
                    if line.strip().startswith('note:'):
                        in_note = True
                        new_lines.append(line)
                    elif in_note and not line.startswith('    ') and line.strip() != '':
                        in_note = False
                        new_lines.append(line)
                    else:
                        new_lines.append(line)

                # If round_2 was indented, fix its indentation to root level (0 spaces)
                fixed_content = re.sub(
                    r'(lets_speak_together:[\s\S]*?)(\n\s+round_2:)',
                    r'\1\nround_2:',
                    content
                )

                # Also, if lst-grid div was open without </div> before round_2:
                # Add </div> </div> if missing
                def close_divs(m):
                    block = m.group(1)
                    # count open vs close divs
                    open_divs = len(re.findall(r'<div\b', block))
                    close_divs = len(re.findall(r'</div>', block))
                    diff = open_divs - close_divs
                    if diff > 0:
                        block = block.rstrip() + '\n' + ('    </div>\n' * diff)
                    return block + '\nround_2:'

                fixed_content = re.sub(
                    r'(lets_speak_together:[\s\S]*?)\n\s*round_2:',
                    close_divs,
                    fixed_content
                )

                if fixed_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)
                    fixed_count += 1

print(f"Fixed {fixed_count} markdown files.")

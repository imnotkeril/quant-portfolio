#!/usr/bin/env python3
"""
Script to fix all imports in the project
Заменяет все 'from app.' на 'from app.'
"""
import os
import re
from pathlib import Path


def fix_imports_in_file(file_path: Path):
    """Fix imports in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Count changes
        original_content = content

        # Replace imports
        content = re.sub(r'from backend\.app\.', 'from app.', content)
        content = re.sub(r'import backend\.app\.', 'import app.', content)

        # Check if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False


def main():
    """Main function to fix all imports"""
    print("🔧 Fixing imports in all Python files...")

    # Get the backend directory
    backend_dir = Path(".")
    if not backend_dir.exists():
        print("❌ backend directory not found!")
        return

    print(f"📁 Scanning directory: {backend_dir.absolute()}")

    # Find all Python files
    python_files = list(backend_dir.glob("**/*.py"))
    fixed_files = []

    for file_path in python_files:
        # Skip __pycache__ and .venv directories
        if "__pycache__" in str(file_path) or ".venv" in str(file_path):
            continue

        if fix_imports_in_file(file_path):
            fixed_files.append(file_path)
            print(f"✅ Fixed: {file_path}")

    if fixed_files:
        print(f"\n🎉 Fixed imports in {len(fixed_files)} files:")
        for file_path in fixed_files:
            print(f"   - {file_path}")
    else:
        print("\n✅ No files needed fixing!")

    print(f"\n📊 Total Python files scanned: {len(python_files)}")
    print(f"📊 Files fixed: {len(fixed_files)}")

    print("\n🚀 Import fixing complete!")
    print("Now you can run: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")


if __name__ == "__main__":
    main()
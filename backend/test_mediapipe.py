#!/usr/bin/env python
# Test different MediaPipe import paths

print("Testing MediaPipe imports...")
print()

# Test 1: mediapipe.python.solutions
try:
    from mediapipe.python.solutions import hands
    print("✓ mediapipe.python.solutions works")
except Exception as e:
    print(f"✗ mediapipe.python.solutions: {e}")

# Test 2: mediapipe.solutions
try:
    from mediapipe.solutions import hands
    print("✓ mediapipe.solutions works")
except Exception as e:
    print(f"✗ mediapipe.solutions: {e}")

# Test 3: Check available submodules
print()
print("Available mediapipe submodules:")
import mediapipe
print(dir(mediapipe))

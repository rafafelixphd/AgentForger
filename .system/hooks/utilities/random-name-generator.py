#!/usr/bin/env python3
"""
Random Name Generator Hook - Pipeline Integration

Generates creative, sprint-style project names when users need inspiration
or haven't defined clear project purposes.

Integrated with the OpenCode pipeline architecture for seamless workflow execution.
"""

import argparse
import random
import sys
import json
from typing import List, Optional

class RandomNameGenerator:
    def __init__(self):
        # Sprint-style word lists for creative project naming
        self.adjectives = [
            "Blue", "Silent", "Golden", "Crimson", "Electric", "Crystal", "Shadow", "Thunder",
            "Mystic", "Cosmic", "Quantum", "Neon", "Phantom", "Titanium", "Obsidian", "Aurora",
            "Vortex", "Zenith", "Nova", "Pulse", "Echo", "Frost", "Blaze", "Storm", "Dawn",
            "Midnight", "Crimson", "Amber", "Jade", "Ruby", "Sapphire", "Emerald", "Diamond"
        ]

        self.nouns = [
            "Elephant", "Thunder", "Mountain", "River", "Forest", "Ocean", "Star", "Moon",
            "Phoenix", "Dragon", "Wolf", "Eagle", "Tiger", "Panda", "Falcon", "Whale",
            "Lightning", "Comet", "Galaxy", "Nebula", "Aurora", "Volcano", "Canyon", "Glacier",
            "Tempest", "Horizon", "Summit", "Cascade", "Monsoon", "Tsunami", "Eclipse", "Meteor"
        ]

        self.tech_terms = [
            "Quantum", "Neural", "Cyber", "Digital", "Matrix", "Vector", "Pixel", "Byte",
            "Circuit", "Algorithm", "Protocol", "Interface", "Framework", "Engine", "Core",
            "Network", "System", "Platform", "Module", "Component", "Service", "API"
        ]

        self.actions = [
            "Launch", "Quest", "Journey", "Mission", "Expedition", "Voyage", "Sprint", "Dash",
            "Climb", "Flow", "Rise", "Fall", "Dance", "Storm", "Hunt", "Chase", "Race", "Flight"
        ]

        self.natural_elements = [
            "Oak", "Pine", "Maple", "Birch", "Willow", "Cedar", "Spruce", "Elm",
            "Rose", "Lily", "Orchid", "Daisy", "Tulip", "Sunflower", "Iris", "Lotus",
            "Stone", "Boulder", "Pebble", "Sand", "Wave", "Tide", "Current", "Stream"
        ]

    def generate_sprint_style(self, count: int = 1) -> List[str]:
        """Generate sprint-style names: Adjective + Noun"""
        names = []
        for _ in range(count):
            adj = random.choice(self.adjectives)
            noun = random.choice(self.nouns)
            names.append(f"{adj} {noun}")
        return names

    def generate_tech_style(self, count: int = 1) -> List[str]:
        """Generate tech-style names: TechTerm + Action/Noun"""
        names = []
        for _ in range(count):
            tech = random.choice(self.tech_terms)
            second = random.choice(self.actions + self.nouns)
            names.append(f"{tech} {second}")
        return names

    def generate_nature_style(self, count: int = 1) -> List[str]:
        """Generate nature-inspired names: NaturalElement + Action/Noun"""
        names = []
        for _ in range(count):
            natural = random.choice(self.natural_elements)
            second = random.choice(self.actions + self.nouns)
            names.append(f"{natural} {second}")
        return names

    def generate_mixed_style(self, count: int = 1) -> List[str]:
        """Generate mixed style names from all categories"""
        names = []
        for _ in range(count):
            # Randomly choose style for each name
            style_choice = random.choice(['sprint', 'tech', 'nature'])
            if style_choice == 'sprint':
                names.extend(self.generate_sprint_style(1))
            elif style_choice == 'tech':
                names.extend(self.generate_tech_style(1))
            else:
                names.extend(self.generate_nature_style(1))
        return names

def generate_names_for_pipeline(context):
    """
    Pipeline-integrated name generation function.

    Args:
        context: Pipeline execution context containing parameters

    Returns:
        dict: Pipeline result with generated names
    """
    generator = RandomNameGenerator()

    # Extract parameters from context
    params = context.get('params', {})
    count = params.get('count', 5)
    style = params.get('style', 'mixed')

    # Validate parameters
    if not isinstance(count, int) or count < 1 or count > 20:
        return {
            'success': False,
            'error': 'Count must be an integer between 1 and 20',
            'generated': []
        }

    if style not in ['sprint', 'tech', 'nature', 'mixed']:
        return {
            'success': False,
            'error': 'Style must be one of: sprint, tech, nature, mixed',
            'generated': []
        }

    try:
        # Generate names based on style
        if style == 'sprint':
            names = generator.generate_sprint_style(count)
        elif style == 'tech':
            names = generator.generate_tech_style(count)
        elif style == 'nature':
            names = generator.generate_nature_style(count)
        else:  # mixed
            names = generator.generate_mixed_style(count)

        return {
            'success': True,
            'style': style,
            'count': len(names),
            'generated': names,
            'message': f'Successfully generated {len(names)} {style}-style project names'
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Name generation failed: {str(e)}',
            'generated': []
        }

def main():
    parser = argparse.ArgumentParser(description='Random Name Generator Hook')
    parser.add_argument('--count', type=int, default=5, help='Number of names to generate')
    parser.add_argument('--style', choices=['sprint', 'tech', 'nature', 'mixed'], default='mixed',
                       help='Naming style (default: mixed)')
    parser.add_argument('--pipeline', action='store_true',
                       help='Run in pipeline mode (expects JSON context)')

    args = parser.parse_args()

    try:
        if args.pipeline:
            # Pipeline mode - read context from stdin
            context = json.load(sys.stdin)
            result = generate_names_for_pipeline(context)
            print(json.dumps(result, indent=2))
        else:
            # Standalone mode
            generator = RandomNameGenerator()

            if args.style == 'sprint':
                names = generator.generate_sprint_style(args.count)
            elif args.style == 'tech':
                names = generator.generate_tech_style(args.count)
            elif args.style == 'nature':
                names = generator.generate_nature_style(args.count)
            else:  # mixed
                names = generator.generate_mixed_style(args.count)

            print("🎲 Generated Project Names:")
            for i, name in enumerate(names, 1):
                print(f"{i:2d}. {name}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
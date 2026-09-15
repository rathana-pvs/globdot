import json
import os
import re

# We will define the 48 comprehensive, multi-source articles across 5 categories and 4 regions.
# Each article has:
# - title (unique broadsheet headline)
# - slug
# - standfirst (lead summary)
# - section (politics, war-tension, climate, tech, other)
# - regions ([americas, asia, europe, middle-east])
# - dateline
# - storyType: "news" or "analysis"
# - homepageSlot: "lead", "secondary", "editors_pick", "standard"
# - sources: list of news sources combined (e.g. ["Associated Press", "Reuters", "BBC News"])
# - image: { url, caption, credit, alt }
# - paragraphs: list of rich structured content sections:
#     - { type: "lead", dateline: "...", text: "..." }
#     - { type: "h3", text: "..." }
#     - { type: "p", text: "..." }
#     - { type: "quote", quote: "...", speaker: "..." }
#     - { type: "p", text: "..." }
#     - { type: "bullets", items: [...] }
#     - { type: "p", text: "..." }


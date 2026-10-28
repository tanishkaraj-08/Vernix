#!/usr/bin/env python3
"""
VERINEX AI — AICTE Case Coordination Intelligence System
Python + Flask Application & Static Server
Problem Statement: SIH26264 | Team 197631
"""

import os
import json
import sqlite3
from flask import Flask, send_from_directory, jsonify, request

app = Flask(__name__, static_folder="dist")

# Ensure SQLite database for audit trails
DB_PATH = os.path.join(os.path.dirname(__file__), "verinex_aicte.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            complaint_id TEXT,
            officer_name TEXT,
            bureau TEXT,
            old_status TEXT,
            new_status TEXT,
            remarks TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "system": "VERINEX AI — AICTE Case Coordination Intelligence System",
        "team_id": "197631",
        "problem_id": "SIH26264",
        "version": "1.0.0"
    })

# Serve Frontend static assets
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"Starting VERINEX AICTE Intelligence Server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)

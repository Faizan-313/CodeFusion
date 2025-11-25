from flask import Flask, request, jsonify
import subprocess
import tempfile
import json
import os

app = Flask(__name__)


def run_python(code, input_data):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as tmp:
        tmp.write(code.encode())
        tmp.flush()

        try:
            result = subprocess.run(
                ["python3", tmp.name],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=2
            )
            return result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return "", "TIMEOUT ERROR"


def run_js(code, input_data):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".js") as tmp:
        tmp.write(code.encode())
        tmp.flush()

        try:
            result = subprocess.run(
                ["node", tmp.name],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=2
            )
            return result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return "", "TIMEOUT ERROR"


def run_cpp(code, input_data):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as source:
        source.write(code.encode())
        source.flush()

        exe_path = source.name.replace(".cpp", "")

    compile_proc = subprocess.run(
        ["g++", source.name, "-o", exe_path],
        capture_output=True,
        text=True,
    )

    if compile_proc.returncode != 0:
        return "", compile_proc.stderr

    try:
        result = subprocess.run(
            [exe_path],
            input=input_data,
            capture_output=True,
            text=True,
            timeout=2
        )
        return result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT ERROR"


@app.post("/run")
def run_code():
    data = request.json

    code = data["code"]
    lang = data["language"]
    test_cases = data["testCases"]

    passed = 0
    results = []

    for tc in test_cases:
        input_data = tc["input"]
        expected = tc["expected"]

        if lang == "python":
            out, err = run_python(code, input_data)
        elif lang == "javascript":
            out, err = run_js(code, input_data)
        elif lang == "cpp":
            out, err = run_cpp(code, input_data)
        else:
            out, err = "", "Language not supported"

        passed_case = (out.strip() == expected.strip() and err == "")

        if passed_case:
            passed += 1

        results.append({
            "input": input_data,
            "expected": expected,
            "output": out,
            "error": err,
            "passed": passed_case
        })

    percentage = int((passed / len(test_cases)) * 100)

    return jsonify({
        "total": len(test_cases),
        "passed": passed,
        "score": percentage,
        "results": results
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)

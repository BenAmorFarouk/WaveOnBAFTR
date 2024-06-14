from flask import Flask, render_template, request
import os

app = Flask(__name__)

@app.route('/')
def index():
    # Get list of files and directories in current directory
    files = os.listdir('.')
    return render_template('index.html', files=files)

@app.route('/browse')
def browse():
    # Get the directory path from the request
    directory = request.args.get('dir', '.')
    
    # Ensure the directory exists and is a directory
    if os.path.exists(directory) and os.path.isdir(directory):
        files = os.listdir(directory)
        return render_template('index.html', files=files, current_directory=directory)
    else:
        return "Invalid directory", 400

if __name__ == '__main__':
    app.run(debug=True)

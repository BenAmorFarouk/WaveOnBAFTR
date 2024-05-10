from flask import Flask, request, send_file, render_template, jsonify
import cv2
import numpy as np
import io

app = Flask(__name__)

scale=0.08

@app.route('/execute_python_function', methods=['GET', 'POST'])
def execute_python_function():
    if request.method == 'POST':
        function_name = request.args.get('function')

        if function_name == 'showContour':
            return show_contours(request.files['image'])
        elif function_name == 'select_contour':
            return select_contour()
        elif function_name == 'draw_contour':
            return draw_contour()
        else:
            return jsonify({"error": "Function not found"})

    return jsonify({"error": "POST request expected"})

@app.route('/')
def index():
    return render_template('index.html')
#############################################################################################################
def process_image():
    global image
    file = request.files['image']
    image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, buffer = cv2.imencode('.png', gray_img)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return io.BytesIO()
############################################################################################################
def show_contours(image_file):
    global image
    image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    for i, contour in enumerate(contours):
        color = (0, 255, 0)  # Default color is green
        cv2.drawContours(image, [contour], -1, color, 2)

    _, buffer = cv2.imencode('.png', image)
    return send_file(io.BytesIO(buffer), mimetype='image/png')

############################################################################################################
def draw_contour():
    # Perform contour drawing and return the image
    # Return a processed image
    return io.BytesIO()

############################################################################################################
def select_contour(event):
    global contours, selected_contour
    selected_contour = None  # Initialize to None
    # Get the coordinates of the click
    x, y = event.x, event.y
    
    # Check if the click is inside any contour
    for contour in contours:
        if cv2.pointPolygonTest(contour, (x, y), False) >= 0:
            # Store the selected contour
            selected_contour = contour
            return True  # Return True if a contour is found
    return False  # Return False if no contour is found

def calculate_contour_area():
    global selected_contour, scale
    if selected_contour is not None and scale is not None:
        pixels_inside = cv2.contourArea(selected_contour)
        mms_inside = pixels_inside * scale
        return mms_inside
    return None  # Return None if no contour is selected or scale is None

if __name__ == '__main__':
    app.run(debug=True)

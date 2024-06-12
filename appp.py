import os
from flask import Flask, request, render_template, redirect, url_for, send_file

app = Flask(__name__, static_url_path='/static')

ftp_started = False  # Flag to check if FTP service has been started

def setup_ftp():
    global ftp_started
    if not ftp_started:
        os.system("dnf -y install vsftpd")
        os.system("systemctl restart vsftpd")
        os.system("systemctl enable vsftpd")
        os.system("firewall-cmd --permanent --add-port=21/tcp")
        os.system("firewall-cmd --reload")
        ftp_started = True

@app.route('/')
def index():
    setup_ftp()  # Start FTP service if not started already
    # Redirect root route to view_folder route
    return redirect(url_for('view_folder', subfolder='main'))

@app.route('/ftp.html', methods=['POST', 'GET'])
def ftp_fun():
    if request.method == 'POST':
        print("okkkkkkkk")
        if request.form['submit'] == 'FTP Stop':
            print("ok1")
            os.system("/sbin/service vsftpd stop")
            return "<script> alert('FTP service Stop');  window.location = 'ftp.html';</script>"
        elif request.form['submit'] == 'Upload File':
            print("ok2")
            ftp_file = request.form['ftp_file']
            ftp_upload_cmd = "copy " + ftp_file + " .\\farouk"  # Copy FTP file to FTP server path 
            print (ftp_upload_cmd)
            os.system(ftp_upload_cmd)
            #os.system("restorecon .\farouk\*")
            return render_template('index.html')
    return render_template('ftp.html')

@app.route('/view_folder/<path:subfolder>')
def view_folder(subfolder):
     global folder_path
     print("Subfolder:", subfolder)
     folder_path = os.path.join("/home/pi", subfolder)
     print("Folder path:", folder_path)
     if os.path.isdir(folder_path):  
         files = os.listdir(folder_path)
         return render_template('view_folder.html', files=files, subfolder=subfolder)
     elif os.path.isfile(folder_path):
         print("File path:", folder_path)
         return send_file(folder_path)
     else:
         print("Invalid path:", folder_path)
         return "yy"

@app.route('/image')
def get_image():
    image_path = folder_path  # Replace with the actual path to your image file
    return send_file(image_path, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

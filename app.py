from flask import Flask, render_template, request, jsonify
from azure.storage.blob import BlobServiceClient
import os
import time
import uuid

class AzureStorageApp:
    def __init__(self):
        self.app = Flask(__name__)
        self.connection_string = "DefaultEndpointsProtocol=https;AccountName=snowflakeazuredemo103;AccountKey=VoHCO6c56mSSGnGf0EzaNgv9n8y1KeV+8a7qBHqNgbvCfQRYHiPvJea38bD6ZVsGYaklkZ0Fzbet+AStRDyCXg==;EndpointSuffix=core.windows.net"
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
        self.container_name = "snowflake-demo"
        self.path = "/"
        self.copied_items = []
        self.pre_path = []
        self.post_path = []

        @self.app.route('/')
        def index():
            file_list = self.populate_files()
            return render_template('index.html', file_list=file_list)

        @self.app.route('/selected_value', methods=['POST'])
        def selected_value():
            selected_value = request.json.get('selectedValue')
            self.path = selected_value
            self.pre_path.insert(0, self.path)
            file_list = self.populate_files()
            return jsonify({'success': True, 'selected_value': selected_value, 'file_list': file_list})

        @self.app.route('/update_dropdown', methods=['POST'])
        def update_dropdown():
            data = request.json
            folder = data.get('name')
            if folder[2:].find(".") != -1:
                new_value = self.path
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': new_value, 'file_list': file_list})
            else:
                self.path += folder[2:] + '/'
                new_value = self.path
                self.pre_path.insert(0, self.path)
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': new_value, 'file_list': file_list})


        @self.app.route('/pre_tab', methods=['POST'])
        def pre_tab():
            if len(self.pre_path) > 1:
                self.path = self.pre_path.pop(1)
                self.post_path.insert(0,self.path)
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': self.path, 'file_list': file_list})
            else:
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': self.path, 'file_list': file_list})


        @self.app.route('/next_tab', methods=['POST'])
        def next_tab():
            print(self.post_path)
            if len(self.post_path) > 1:
                self.path = self.post_path.pop(1)
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': self.path, 'file_list': file_list})

            elif len(self.post_path) == 1:
                self.path = self.post_path.pop(0)
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': self.path, 'file_list': file_list})

            else:
                file_list = self.populate_files()
                return jsonify({'success': True, 'newValue': self.path, 'file_list': file_list})

        @self.app.route('/upload_file', methods=['POST'])
        def upload_file():
            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file part'})
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No selected file'})

            # Upload the file to Azure Blob Storage
            container_client = self.blob_service_client.get_container_client(self.container_name)
            blob_name = os.path.join(self.path, file.filename)
            blob_client = container_client.get_blob_client(blob=blob_name)
            blob_client.upload_blob(file)

            file_list = self.populate_files()
            return jsonify({'success': True, 'file_list': file_list})


    def populate_files(self):
        container_client = self.blob_service_client.get_container_client(self.container_name)
        blobs = container_client.list_blobs(name_starts_with=self.path)

        files = []
        path_list = self.path.split('/')
        path_list.remove('')

        for blob in blobs:
            parts = blob.name.split('/')
            if len(parts) > len(path_list):
                break
            else:
                files.append(parts[len(path_list) - 1])

        table_lists = []
        for file in files:
            file_path = os.path.join(self.path, file)
            blob_client = container_client.get_blob_client(blob=file_path)

            properties = blob_client.get_blob_properties()
            modified_date = properties.last_modified
            size = properties.size

            if file.find(".") != -1:
                file_name = "📄" + ' ' + file
            else:
                file_name = "📁" + ' ' + file

            files_detail = {}
            files_detail['name'] = file_name
            files_detail['modified_date'] = str(modified_date.strftime("%d-%m-%Y %H:%M"))
            files_detail['size'] = str(size) + ' KB'
            table_lists.append(files_detail)

        return table_lists

    def run(self):
        self.app.run(debug=True)

if __name__ == '__main__':
    azure_app = AzureStorageApp()
    azure_app.run()

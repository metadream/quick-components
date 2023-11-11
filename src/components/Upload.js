import styles from '../styles/upload.css';
import downloadIcon from '../icons/round-download.svg';
import removeIcon from '../icons/round-cross.svg';
import Quick from '../Quick.js';
import { createElement, nanoId } from "../modules/Util.js";
import { Locale } from '../modules/Locale.js';
import { Component } from './Component.js';

export class Upload extends Component {

    styles = styles;
    template = `
        <div class="quick-upload">
            <div>
                <input type="file" accept="{{accept}}"/>
                <a class="chooser">${Locale.get('UPLOAD_BUTTON_TEXT')}</a>
            </div>
            <div class="file-list"></div>
        </div>`;

    onConnected() {
        const $file = this.getElement('input[type="file"]');
        const $chooser = this.getElement('a.chooser');
        $chooser.on('click', () => $file.click());
        $file.on('change', e => this.upload(e.target.files));

        this._entries = [];
        this.maxSize = JSON.parse(this.getAttribute('maxsize')) || 1;
        this.maxFiles = JSON.parse(this.getAttribute('multiple')) || 1;
        if (this.maxFiles > 1) {
            $file.setAttribute('multiple', 'multiple');
        }
    }

    async upload(files) {
        if (!files || files.length === 0) {
            Quick.info(Locale.get('NO_FILES_SELECTED'));
            return;
        }
        if (files.length > this.maxFiles) {
            Quick.warning(Locale.get('MAX_ALLOWED_COUNT') + this.maxFiles);
            return;
        }
        for (const file of files) {
            if (file.size > this.maxSize * 1024 * 1024) {
                return Quick.warning(Locale.get('MAX_ALLOWED_SIZE') + this.maxSize + 'MB');
            }
        }
        for (const file of files) {
            const tempUrl = URL.createObjectURL(file);
            const entry = {
                _id: nanoId(),
                originalName: file.name,
                previewUrl: tempUrl,
                downloadUrl: tempUrl,
                file
            };
            if (this.uploadCallback) {
                await this.uploadCallback(entry);
                this.render(entry);
            }
        }
    }

    render(entry) {
        if (!entry || !entry._id) return;
        const $entry = createElement(`
            <div class="file-entry" id="${entry._id}">
                <a class="preview-link" target="_blank" href="${entry.previewUrl}">${entry.originalName}</a>
                <a class="download-icon" href="${entry.downloadUrl}" download="${entry.originalName}">${downloadIcon}</a>
                <a class="remove-icon">${removeIcon}</a>
            </div>
        `);

        const $removeBtn = $entry.querySelector('.remove-icon');
        $removeBtn.on('click', () => this.remove(entry));

        const $uploadList = this.getElement('.file-list');
        $uploadList.append($entry);
        this._entries.push(entry);
    }

    remove(entry) {
        Quick.confirm(Locale.get('DELETE_FILE_CONFIRMATION'), async (_cfm, btn) => {
            if (!entry.file && this.removeCallback) {
                btn.loadding = true;
                await this.removeCallback(entry);
                btn.loadding = false;
                Quick.success(Locale.get('DELETE_FILE_SUCCESS'));
            }

            const $entry = this.getElement('#' + entry._id);
            $entry.remove();

            const index = this.entries.findIndex(v => v._id == entry._id);
            this.entries.splice(index, 1);
        });
    }

    get entries() {
        return this._entries;
    }

    set entries(entries) {
        this._entries.length = 0;
        if (entries && Array.isArray(entries)) {
            entries.forEach(v => this.render(v));
        }
    }

    set onUpload(callback) {
        this.uploadCallback = callback;
    }

    set onRemove(callback) {
        this.removeCallback = callback;
    }

}
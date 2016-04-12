var NoteMaker = {

    GetDataFromLocalStorage: function (type) {
        var data = this.UseLocalStorage('Get');
        if (undefined === data || undefined === data.nID) {
            if (type === 'Notes_Data') {
                return [];
            } else {
                return 0;
            }
        } else {
            if (type === 'Notes_Data') {
                return data.oNotesData;
            } else {
                return data.nID;
            }
        }
    },

    UseLocalStorage: function (type, data) {
        if (undefined !== Storage && undefined !== localStorage) {
            if (type === 'Get') {
                return JSON.parse(localStorage.getItem("NoteMaker"));
            } else {
                localStorage.setItem("NoteMaker", JSON.stringify(data));
            }
        } else {
            if (this.NoteMyNotes.once) {
                alert("There is no local storage available in your browser. Run 'Note my Notes' in latest browser");
                this.NoteMyNotes.once = false;
            }
            return;
        }
    },

    NoteMyNotes: {
        once: true,
        arrNotes: [],
        id: 0,
        NoteListChunk: '<div class="E_Note">' +
                            '<div id="E_NoteTitle" class="E_NoteTitle">{title}</div>' +
                            '<div id="E_NoteDescription" class="E_NoteDescription">{description}</div>' +
                        '</div>' +
                        '<div class="Buttons_Pane">' +
                            '<div class="Buttons" onclick="NoteMaker.EditNote(event, {id})">Edit</div>' +
                            '<div class="Buttons" onclick="NoteMaker.DeleteNote(event, {id})">Delete</div>' +
                        '</div>',

        NoteHeaderNoNote: 'No Notes Present. Click on <b>Add a Note</b>',
        NoteAdded: 'Your Note has been Added.',
        NoteUpdated: 'Your Note has been Updated.',
        NoteDeleted: 'Your Note has been Deleted.',
        NotesDeleted: 'All your notes have been deleted'
    },

    Init: function () {
        this.NoteMyNotes.arrNotes = this.GetDataFromLocalStorage('Notes_Data');
        this.NoteMyNotes.id = this.GetDataFromLocalStorage('ID_Data');
        if (this.NoteMyNotes.arrNotes.length > 0) {
            for (var i = 0; i < this.NoteMyNotes.arrNotes.length; i++) {
                this.AddToList(this.NoteMyNotes.arrNotes[i]);
            }
        }
        if (this.NoNoteState()) {
            document.getElementById('NoteHeader').innerHTML = this.NoteMyNotes.NoteHeaderNoNote;
            this.NoteHeaderHighlight('red');
        }
    },

    Note: function (id) {
        this.Id = id;
        this.Title = null;
        this.Description = null;
        this.CreateDate = new Date();
    },

    NoteHeaderHighlight: function (color) {
        document.getElementById('NoteHeader').style.color = color;
    },

    ClosePopup: function () {
        document.getElementById('EditSection').style.display = 'none';
        this.ResetValidation();
        document.getElementById('EditTitle').value = "";
        document.getElementById('EditDescription').value = "";
    },

    Validation: {
        valid: true,
        TitleExists: "A note with same name already exists. Please provide a different Title.",
        TitleNotProvided: "Please enter a Title for your Note...",
        DescriptionNotProvided: "Please enter a description for your Note...",
        CurrentValidationText: ""
    },

    ResetValidation : function(){
        var title = document.getElementById('EditTitle');
        var description = document.getElementById('EditDescription');

        // Reset Validation
        document.getElementById('Validation').style.display = 'none';
        this.Validation.CurrentValidationText = "";
        this.Validation.valid = true;
        title.style.backgroundColor = "white";
        description.style.backgroundColor = "white";
    },

    NoNoteState: function () {
        if (this.NoteMyNotes.arrNotes.length == 0) {
            document.getElementById('DelButton').style.display = 'none';
            this.NoteMyNotes.id = 0;
            return true;
        }
    },

    SaveNote: function (id, originalEditElement) {
        var title = document.getElementById('EditTitle');
        var description = document.getElementById('EditDescription');

        this.ResetValidation();

        if (originalEditElement) {
            var oEditParentNode = originalEditElement.parentNode.parentNode;
            var editedTitle = oEditParentNode.children[0].children[0].innerHTML;
            if (!!editedTitle) {
                editedTitle.trim();
            }
        }

        if (!this.Validate(title)) {
            this.Validation.CurrentValidationText = this.Validation.TitleNotProvided;
            this.Validation.valid = false;
        }
        else if (!this.Validate(description)) {
            this.Validation.CurrentValidationText = this.Validation.DescriptionNotProvided;
            this.Validation.valid = false;
        }
        else if (!this.CheckIfTitleExists(title, editedTitle)) {
            this.Validation.CurrentValidationText = this.Validation.TitleExists;
            this.Validation.valid = false;
        }
        if (!this.Validation.valid) {
            // Show validation error messages
            document.getElementById('Validation').innerText = this.Validation.CurrentValidationText;
            document.getElementById('Validation').style.display = 'block';
            return;
        } else {
            // Save Note
            if (undefined == id) {
                // If id is undefined then Create new element
                var oNote = new this.Note(this.NoteMyNotes.id++);
                oNote.Title = title.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                oNote.Description = description.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                this.NoteMyNotes.arrNotes.push(oNote);
                this.AddToList(oNote);
                document.getElementById('NoteHeader').innerHTML = this.NoteMyNotes.NoteAdded;
                this.NoteHeaderHighlight('green');
            } else {
                // Save existing one
                var oEditParentNode = originalEditElement.parentNode.parentNode;
                oEditParentNode.children[0].children[0].innerHTML = title.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                oEditParentNode.children[0].children[1].innerHTML = description.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                this.UpdateList(id, title.value, description.value);
                document.getElementById('NoteHeader').innerHTML = this.NoteMyNotes.NoteUpdated;
                this.NoteHeaderHighlight('aqua');
            }
            // Save data into Local storage
            this.UseLocalStorage('Set', {
                oNotesData: this.NoteMyNotes.arrNotes,
                nID: this.NoteMyNotes.id
            });
            document.getElementById('EditSection').style.display = 'none';
            document.getElementById('DelButton').style.display = 'block';
        }
    },

    AddToList: function (oNote) {
        var sNewNoteChunk = this.NoteMyNotes.NoteListChunk.replace(/{id}/g, oNote.Id).replace("{title}", oNote.Title).replace('{description}', oNote.Description);
        var oParent = document.getElementById('SavedNote');
        var oNewNoteDiv = document.createElement('div');
        oNewNoteDiv.className = 'IndividualNote';
        oNewNoteDiv.innerHTML = sNewNoteChunk;
        oParent.insertBefore(oNewNoteDiv, oParent.firstChild);
    },

    UpdateList: function (id, title, description) {
        var arrNotes = this.NoteMyNotes.arrNotes;
        for (var i = 0; i < arrNotes.length; i++) {
            if (arrNotes[i].Id === id) {
                arrNotes[i].Title = title;
                arrNotes[i].Description = description;
                return;
            }
        }
    },

    RemoveFromList: function (id) {
        var arrNotes = this.NoteMyNotes.arrNotes;
        for (var i = 0; i < arrNotes.length; i++) {
            if (arrNotes[i].Id === id) {
                arrNotes.splice(i, 1);
                return;
            }
        }
    },

    Validate: function (element) {
        if (!(element.value)) {
            element.style.backgroundColor = "darkGrey";
            return false;
        } else {
            element.style.backgroundColor = "white";
            return true;
        }
    },

    CheckIfTitleExists: function (element, editedtitle) {
        var arrNotes = this.NoteMyNotes.arrNotes;
        for (var i = 0; i < arrNotes.length; i++) {
            if (arrNotes[i].Title.toLowerCase().trim() === element.value.toLowerCase().trim()) {
                // If an edited item has the same name, then it is OK
                if (editedtitle && element.value.toLowerCase().trim() === editedtitle.toLowerCase().trim()) {
                    return true;
                }
                element.style.backgroundColor = "darkGrey";
                return false;
            }
        }
        element.style.backgroundColor = "white";
        return true;
    },

    AddNote: function () {
        var that = this;
        document.getElementById('EditSection').style.display = 'block';
        document.getElementById('EditTitle').value = "";
        document.getElementById('EditDescription').value = "";

        var oOrigElement = document.getElementById("SaveAddEdit");
        var oNewElement = oOrigElement.cloneNode(true);
        oOrigElement.parentNode.replaceChild(oNewElement, oOrigElement);

        document.getElementById('SaveAddEdit').addEventListener('click', function () {
            return that.SaveNote();
        });
    },

    EditNote: function (event, id) {
        var ev = event;
        var that = this;
        document.getElementById('EditSection').style.display = 'block';
        document.getElementById('EditTitle').value = this.NoteMyNotes.arrNotes[id].Title.replace('&lt;', '<').replace('&gt;', '>');
        document.getElementById('EditDescription').value = this.NoteMyNotes.arrNotes[id].Description.replace('&lt;', '<').replace('&gt;', '>');;

        var old_element = document.getElementById("SaveAddEdit");
        var new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);

        document.getElementById('SaveAddEdit').addEventListener('click', (function () {
            var originalEditElement = ev.target || ev.srcElement;
            return that.SaveNote(that.NoteMyNotes.arrNotes[id].Id, originalEditElement);
        }));
    },

    DeleteNote: function (event, id) {
        var originalEditElement = event.target || event.srcElement;
        var oEditParentNode = originalEditElement.parentNode.parentNode;

        oEditParentNode.parentNode.removeChild(oEditParentNode);
        this.RemoveFromList(id);
        document.getElementById('NoteHeader').innerHTML = this.NoteMyNotes.NoteDeleted;
        this.NoteHeaderHighlight('grey');
        this.NoNoteState();
    },

    DeleteAllNotes: function () {
        document.getElementById('SavedNote').innerHTML = "";
        this.NoteMyNotes.arrNotes = [];
        document.getElementById('NoteHeader').innerHTML = this.NoteMyNotes.NotesDeleted;
        this.NoteHeaderHighlight('black');
        this.NoNoteState();
        this.UseLocalStorage('Set', {});
    }
}

NoteMaker.Init();
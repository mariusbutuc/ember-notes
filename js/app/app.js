var Notes = Ember.Application.create({
  LOG_TRANSITIONS: true
});

Notes.Router.map(function () {
  // creates default
  //    * Notes.NotesRoute
  //    * Notes.NotesController
  //    * Notes.NotesView
  //    * notes template
  this.resource('notes',  {path: '/'}, function() {
    // creates default
    //    * Notes.NotesNoteRoute
    //    * Notes.NotesNoteController
    //    * Notes.NotesNoteView
    //    * notes/note template
    this.route('note', {path: '/note/:note_id'});
  });
});

Notes.NotesRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('note');
  }
});

Notes.NotesNoteRoute = Ember.Route.extend({
  model: function(note) {
    return this.store.find('note', note.note_id);
  }
})

Notes.Store = DS.Store.extend({
  adapter: DS.LSAdapter
});

Notes.Note = DS.Model.extend({
  name: DS.attr('string'),
  value: DS.attr('string')
});

Notes.NotesController = Ember.ArrayController.extend({
  needs: ['notesNote'],
  newNoteName: null,

  actions: {
    createNewNote: function() {
      var content = this.get('content'),
          newNoteName = this.get('newNoteName'),
          unique = newNoteName != null && newNoteName.length > 1;

      content.forEach(function(note) {
        if (newNoteName === note.get('name')) {
          unique = false;
          return;
        }
      });

      if (unique) {
        var newNote = this.store.createRecord('note');
        newNote.set('id', newNoteName);
        newNote.set('name', newNoteName);
        newNote.save();

        this.set('newNoteName', null);
      } else {
        alert ('Note must have an unique name of at least 2 characters!');
      }
    },

    deleteNote: function(note) {
      this.set('noteForDeletion', note);
      $("#confirm-delete-note-dialog").modal({
        show: true
      });
    },

    cancelDelete: function() {
      this.set('noteForDeletion', null);
      $("#confirm-delete-note-dialog").modal('hide');
    },

    confirmDelete: function() {
      var selectedNote = this.get('noteForDeletion');
      this.set('noteForDeletion', null);
      if (selectedNote) {
        this.store.deleteRecord(selectedNote); // only marks the note as deleted
        selectedNote.save(); // call save() on the note object to fulfill the delete

        if (this.get('controllers.notesNote.model.id') === selectedNote.get('id')) {
          this.transitionToRoute('notes');
        }
      }
      $("#confirm-delete-note-dialog").modal('hide');
    },
  }
});

Notes.NotesNoteController = Ember.ObjectController.extend({
  actions: {
    updateNote: function() {
      var content = this.get('content');
      console.log(content);
      if (content) {
        content.save();
      }
    }
  }
});

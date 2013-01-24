var Notes = Ember.Application.create();

/** Router **/
Notes.Router = Ember.Router.extend();

Notes.Router.map(function (match) {
  match('/').to('notes');
});

Notes.NotesRoute = Ember.Route.extend({
  setupController: function (controller) {
    controller.set('content', []);
    var selectedNoteController = this.controllerFor('selectedNote');
    selectedNoteController.set('notesController', controller);
  },

  renderTemplate: function () {
    this.render('notes', {
      outlet: 'notes'
    });

    var selectedNoteController = this.controllerFor('selectedNote');

    this.render('selectedNote', {
      outlet: 'selectedNote',
      controller: selectedNoteController
    });
  }
});

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({});

Notes.NotesController = Ember.ArrayController.extend({
  content: [],
  newNoteName: null,

  createNewNote: function() {
    var content     = this.get('content');
    var newNoteName = this.get('newNoteName');
    var unique      = true;

    content.forEach(function(note) {
      if (newNoteName === note.get('name')) {
        unique = false;
        return;
      }
    });

    if (unique) {
      content.pushObject(
        Ember.Object.create({"name": newNoteName, "value": ""})
      );
      this.set('newNoteName', null);
    } else {
      alert('Notes must have unique names.')
    }
  },

  doDeleteNote: function() {
    $("#confirmDeleteConfimDialog").modal({show: true});
  },

  doConfirmDelete: function() {
    var selectedNote = this.get('selectedNote');
    if (selectedNote) {
      this.get('content').removeObject(selectedNote);
      this.set('selectedNote', null);
    }
    $("#confirmDeleteConfimDialog").modal('hide');
  },

  doCancelDelete: function() {
    $("#confirmDeleteConfimDialog").modal('hide');
  },

  deleteSelectedNote: function() {
    var selectedNote = this.get('selectedNote');
    if (selectedNote) {
      this.get('content').removeObject(selectedNote);
      this.set('selectedNote', null);
    }
  }
});

Notes.SelectedNoteController = Ember.ObjectController.extend({
  contentBinding: 'notesController.selectedNote',
  notesController: null
});

/** Views **/
Notes.ApplicationView = Ember.View.extend({
  templateName: 'applicationTemplate'
});

Notes.NotesView = Ember.View.extend({
  elementId: 'notes',
  classNames: ['azureBlueBackground', 'azureBlueBorderThin']
});

Notes.SelectedNoteView = Ember.View.extend({
  elementId: 'selectedNote'
});

Notes.TextField = Ember.TextField.extend(Ember.TargetActionSupport, {
  insertNewline: function() {
    this.triggerAction();
  }
});
Notes.NoteListView = Ember.View.extend({
  elementId: 'noteList',
  template: Ember.Handlebars.compile('' +
  '{{#each controller}}' +
    '{{view Notes.NoteListItemView contentBinding="this"}}' +
  '{{/each}}')
});

Notes.NoteListItemView = Ember.View.extend({
  template: Ember.Handlebars.compile('' +
    '{{name}}' +
    '{{#if view.isSelected}}' +
      '<button {{action doDeleteNote}} class="btn btn-mini floatRight btn-danger smallMarginBottom">Delete</button>' +
    '{{/if}}'
  ),
  classNames: ['pointer', 'noteListItem'],

  classNameBindings: "isSelected",

  isSelected: function() {
    return this.get('controller.selectedNote.name') === this.get('content.name');
  }.property('controller.selectedNote.name'),

  click: function() {
    this.get('controller').set('selectedNote', this.get('content'));
  }
});

Notes.ConfirmDialogView = Ember.View.extend({
  templateName: 'confirmDialog',
  classNames: ['modal', 'hide'],

  cancelButtonLabel: 'Cancel',
  cancelAction: null,
  okButtonLabel: 'OK',
  okAction: null,
  header: null,
  message: null,
  target: null
});

Notes.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
  tagName: 'button',
  classNames: ['button'],
  disabled: false,

  click: function() {
    if (!this.get('disabled')) {
      this.triggerAction();
    }
  },

  template: Ember.Handlebars.compile('{{#if view.iconName}}<i {{bindAttr class="view.iconName"}}></i>{{/if}}{{view.content}}')
});

Notes.initialize();

/** Templates **/
Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
  '{{outlet notes}} {{outlet selectedNote}}'
);

Ember.TEMPLATES['confirmDialog'] = Ember.Handlebars.compile(
  '<div class="modal-header centerAlign">' +
    '<button type="button" class="close" data-dismiss="modal" class="floatRight">×</button>' +
    '<h1 class="centerAlign">{{view.header}}</h1>' +
  '</div>' +
  '<div class="modal-body">' +
    '{{view.message}}' +
  '</div>' +
  '<div class="modal-footer">' +
    '{{#if view.cancelAction}}' +
      '{{view Notes.BootstrapButton ' +
        'contentBinding="view.cancelButtonLabel" ' +
        'actionBinding="view.cancelAction" ' +
        'targetBinding="view.target"}}' +
    '{{/if}}' +
    '{{#if view.okAction}}' +
      '{{view Notes.BootstrapButton ' +
        'contentBinding="view.okButtonLabel" ' +
        'actionBinding="view.okAction" ' +
        'targetBinding="view.target"}}' +
    '{{/if}}' +
  '</div>'
);

Ember.TEMPLATES['notes'] = Ember.Handlebars.compile('' +
  '{{view Notes.TextField target="controller" action="createNewNote" classNames="input-small search-query mediumTopPadding" valueBinding="controller.newNoteName"}}' +
  '<button class="btn" {{action createNewNote}}>Add</button>' +
  '{{view Notes.NoteListView}}' +

  '{{view Notes.ConfirmDialogView ' +
    'elementId="confirmDeleteConfimDialog" ' +
    'okAction="doConfirmDelete" ' +
    'cancelAction="doCancelDelete" ' +
    'target="controller" ' +
    'header="Delete selected note?" ' +
    'message="Are you sure you want to delete the selected Note? This action cannot be be undone!" ' +
  '}}'
);

Ember.TEMPLATES['selectedNote'] = Ember.Handlebars.compile('' +
  '{{#if controller.content}}' +
    '<h1>{{name}}</h1>' +
    '{{view Ember.TextArea valueBinding="value"}}' +
  '{{/if}}'
);
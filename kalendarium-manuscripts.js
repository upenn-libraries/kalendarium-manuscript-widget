$(document).ready(function(){

  //@remote
  //var url_target = 'http://kalendarium-manuscripts.herokuapp.com/'
  // @todo - add check to make sure it's up before we do anything

  //@local
  var url_target = 'http://localhost:5000';

  var bootstrap = function() {
    var elements = $.kmw

    // @todo change to display title at top
    $form = $('<form id="kmw" role="form"><h1>Manuscript Lookup</h1><div id="kmw-messages" class="alert"></div><div id=kmw-fields></div><input type="button" id="kmw-add" class="btn btn-default" value="Add" /><input type="button" id="kmw-clear" class="btn btn-default" value="clear" /></form>');

    // Add the form to the expected container
    $('#kmw-container').append($form);

    // Set the lookup form as the default form field group
    lookupForm();
  }

  var lookupForm = function() {
    $('#kmw-fields').removeClass('editing');
    $('#kmw-fields').addClass('lookup');

    lookupFieldElements = [
      {'element':'mid', 'v':'', 'label':'ID', 'fieldtype':'text'},
      {'element':'name', 'label':'Name', 'v':'', 'fieldtype':'text'},
      {'element':'shelfmark', 'label':'Shelfmark', 'v':'', 'fieldtype':'text'}
    ];

    $(lookupFieldElements).each(function() {
      $this = $(this);

      // Wrap each collection field for bootstrap
      var $formElement = $('<div class="form-group"></div>');

      var $elementLabel = $('<label class="control-label" for="#kmw-val-' + $this[0].element + '">' + $this[0].label + '</label>');

      var $elementContainer = $('<div class=""><input type="textfield" class="form-control" id="kmw-val-' + $this[0].element + '"></div>');

      // Append the element or group label and field to the container
      $formElement.append($elementLabel, $elementContainer);

      // Append the form group to the form
      $('#kmw-fields').append($formElement)

    })

    // Append the lookup button to the id field
    $('#kmw-val-mid').parent().addClass('input-group');
    $('#kmw-val-mid').after('<span class="input-group-btn"><input type="button" id="kmw-find" class="btn btn-default" value="Find" /></span>');

  }

  var editForm = function() {
    $('#kmw-fields').removeClass('lookup');
    $('#kmw-fields').addClass('editing');

    var elements = $.kmw

    // append each field to the form
    $(elements).each(function() {
      $this = $(this);

      // Wrap each collection field for bootstrap
      var $formElement = $('<div class="form-group"></div>');

      var $elementLabel = $('<label class="control-label" for="#kmw-val-' + $this[0].element + '">' + $this[0].label + '</label>');

      // Add a basic input field object
      if ($this[0].fieldtype === 'text') {
        var $elementContainer = $('<div class=""><input type="textfield" class="form-control" id="kmw-val-' + $this[0].element + '"></div>');

      // Add a select field object
      } else if ($this[0].fieldtype === 'list') {
        var $elementContainer = $('<div class=""><select class="form-control" id="kmw-val-' + $this[0].element + '"></select>');

        var elementOptions = '';

        $.each($this[0].options, function(key, val) {
          elementOptions +='<option value= ' + key + '>' + val + '</option>'
        })

        $elementContainer.find('select').append(elementOptions)

      // Groups handle more complex types, including dates, grading, and dimensions
      } else if ($this[0].fieldtype === 'group') {
        var groupId = $this[0].element;
        var $elementContainer = $('<div class="form-group"><div id="kmw-val-' + groupId + '"></div>');

        // Subfields within groups are either lists or text fields
        $.each($this[0].group, function() {
          if ($(this)[0].fieldtype === 'text') {
            var subfieldLabel = $('<label class="control-label" for="#kmw-val-' + $(this)[0].element + '">' + $(this)[0].label + '</label>');

            var subfield = $('<input type="textfield" class="form-control" id="kmw-val-' + $(this)[0].element + '">');
            $($elementContainer).find('#kmw-val-' + groupId).append(subfieldLabel, subfield)

          } else if ($(this)[0].fieldtype === 'list') {

            var subfieldLabel = $('<label class="control-label" for="#kmw-val-' + $(this)[0].element + '">' + $(this)[0].label + '</label>');
            var $subContainer = $('<div class=""><select class="form-control" id="kmw-val-' + $(this)[0].element + '"></select></div>');

            var subOptions = '';

            $.each($(this)[0].options, function(key, val) {

              subOptions +='<option value= ' + key + '>' + val + '</option>'

            })
            // Build the select object
            $subContainer.find('select').append(subOptions);
            // Append the label and list to the element group
            $($elementContainer).find('#kmw-val-' + groupId).append(subfieldLabel, $subContainer)

          }
        })
      }

      // Append the element or group label and field to the container
      $formElement.append($elementLabel, $elementContainer);

      // Append the form group to the form
      $('#kmw-fields').append($formElement)

    })

    // Make the internal ID read-only
    $('#kmw-val-mid').prop("readonly",true);

  }

  //  Lookups use the internal ID, Name, and Shelfmark
  var submitLookup = function(m_id) {

    dataReset()
    formReset()
    $.ajax({
      url: url_target + '/api/manuscript/' + m_id,
      dataType: 'json',
      crossDomain: true,
      success: function(data)
      {
        if (data.mid) {
          $.map(data, function(value, key){

            for (var i = 0; i < $.kmw.length; i++) {
              if($.kmw[i].element == key){
                $["kmw"][i]["v"] = value
              }
            };
          })

          clearFeedback()
          $('#kmw-val-mid').closest('.form-group').addClass('has-success has-feedback')
          formUpdate()
        }
        else {
          clearFeedback()
          $('#kmw-val-mid').closest('.form-group').addClass('has-error has-feedback')
          $('#kmw-clear').click()

          $('#kmw-messages').addClass('alert-warning').text("Did not find manuscript " + m_id)
        }
      }
    });
  }

  // deprecated, retained for reference
  var submitAdd = function() {

    var post_obj = new Object();
    for (var i = 0; i < $.kmw.length; i++) {
      post_obj[$.kmw[i].element] = $.kmw[i].v
    };

    var post_string = JSON.stringify(post_obj);

    $.ajax({
      url: url_target + '/api/manuscript/add',
      type: 'POST',
      data: post_string,
      dataType: 'json',
      crossDomain: true,
      success: function(data)
      {
        //console.log('return' , data)
      },
      error: function(data)
      {
        //console.log('problem', data)
      }
    });
  }

  var submitEdit = function(m_id) {
    var post_obj = new Object();
    for (var i = 0; i < $.kmw.length; i++) {
      post_obj[$.kmw[i].element] = $.kmw[i].v
    };

    var post_string = JSON.stringify(post_obj);

    $.ajax({
      url: url_target + '/api/manuscript/' + m_id + '/edit',
      type: 'POST',
      data: post_string,
      dataType: 'json',
      crossDomain: true,
      success: function(data)
      {
        //console.log('return' , data)
      },
      error: function(data)
      {
        //console.log('problem', data)
      }
    });
  }

  // Reset form data and timers
  var formReset = function() {
    // reset form values
    $('#kmw-fields input').not('#kmw-find').each(function(){
      $(this).val('')
    })

    // All select element zero values are default
    $('#kmw-fields select').find("option[value='0']").attr("selected","selected");
  }

  var formUpdate = function(data) {
    formReset();

    $('#kmw-fields input').each(function(){
      // get key from id
      element_name = $(this).attr("id").substr(8)

      for (var i = 0; i < $.kmw.length; i++) {
        if ($["kmw"][i]["element"] == element_name) {
          $(this).val($["kmw"][i]["v"])
        }
      };
    })

    $('#kmw-fields select').each(function(){
      // get key from id
      element_name = $(this).attr("id").substr(8)

      for (var i = 0; i < $.kmw.length; i++) {
        if ($["kmw"][i]["element"] == element_name) {
          $(this).val($["kmw"][i]["v"])
        }
      };
    })
  }

  var dataReset = function() {
    for (var i = 0; i < $.kmw.length; i++) {
      $["kmw"][i]["v"] = ''
    };
  }

  var dataUpdate = function() {
    // get input fields
    $('#kmw-fields input').each(function(){
      // get key from id
      element_name = $(this).attr("id").substr(8)

      for (var i = 0; i < $.kmw.length; i++) {
        if ($["kmw"][i]["element"] == element_name) {
          $["kmw"][i]["v"] = $(this).val()
        }
      };
    })

    // get select fields
    $('#kmw-fields select').each(function(){
      // get key from id
      element_name = $(this).attr("id").substr(8)

      for (var i = 0; i < $.kmw.length; i++) {
        if ($["kmw"][i]["element"] == element_name) {
          $["kmw"][i]["v"] = $(this).val()
        }
      };
    })
  }

  var clearFeedback = function() {
    // remove feedback formatting
    $('#kmw-fields .has-feedback').removeClass('has-feedback')
    $('#kmw-fields .has-success').removeClass('has-success')
    $('#kmw-fields .has-error').removeClass('has-error')
    $('#kmw .alert-success').removeClass('alert-success')
    $('#kmw .alert-warning').removeClass('alert-warning')
    $('#kmw-messages').text('')
  }

  // Massive configuration array
  $.kmw = [
    {'element':'mid', 'v':'', 'label':'ID', 'fieldtype':'text'},
    {'element':'name', 'label':'Name', 'v':'', 'fieldtype':'text'}, // text
    {'element':'provenance', 'label':'Provenance', 'v':'', 'fieldtype':'text'},

    {'element':'shelfmark', 'label':'Shelfmark', 'v':'', 'fieldtype':'text'}, //text
    {'element':'mtype', 'label':'Book Type', 'v':'', 'fieldtype':'text', 'options':''},  // list
    {'element':'is_integral', 'label':'Is the calendar integral?', 'v':'', 'fieldtype':'list', 'options':{'1':'Yes','0':'No'}}, //bool

    {'element':'grading', 'label':'Grading (Importance)', 'fieldtype':'group', 'group':[
      {'element':'grade_black', 'label':'Black', 'v':'', 'fieldtype':'list', 'options':{'0':'','1':'1','2':'2','3':'3','4':'4'}},
      {'element':'grade_blue', 'label':'Blue', 'v':'', 'fieldtype':'list', 'options':{'0':'','1':'1','2':'2','3':'3','4':'4'}},
      {'element':'grade_red', 'label':'Red', 'v':'', 'fieldtype':'list', 'options':{'0':'','1':'1','2':'2','3':'3','4':'4'}},
      {'element':'grade_gold', 'label':'Gold', 'v':'', 'fieldtype':'list', 'options':{'0':'','1':'1','2':'2','3':'3','4':'4'}}
    ]},

    {'element':'shading', 'label':'Has shading?', 'v':'', 'fieldtype':'list', 'options':{'1':'Yes','0':'No'}},
    {'element':'ms_or_print', 'label':'Manuscript or Print', 'v':'', 'fieldtype':'list', 'options':{'0':'Unknown','manuscript':'Manuscript','print':'Print'}}, //bool
    {'element':'language', 'label':'Language', 'v':'', 'fieldtype':'text', 'options':''}, //list?
    {'element':'origin', 'label':'Origin / Place', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'origin_note', 'label':'Origin Note', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'destination', 'label':'Destination', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'destination_note', 'label':'Destination note', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'script', 'label':'Script', 'v':'', 'fieldtype':'text', 'options':''},  //text

    // length x width x height, limited to .5 cm
    {'element':'dimensions', 'label':'Physical Dimensions', 'fieldtype':'group', 'group': [
      {'element':'dim_length', 'label':'L', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'dim_width', 'label':'W', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'dim_height', 'label':'H', 'v':'', 'fieldtype':'text', 'options':''}
    ]},  //comp

    // length x width x height, limited to .5 cm
    {'element':'tb_dimensions', 'label':'Text block dimensions', 'fieldtype':'group', 'group': [
      {'element':'tb_dim_length', 'label':'L', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'tb_dim_width', 'label':'W', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'tb_dim_height', 'label':'H', 'v':'', 'fieldtype':'text', 'options':''}
    ]},  //comp

    // Dates are a set of dropdowns that provide [modifier][year] - [modifier][year]
    {'element':'ms_date', 'label':'Manuscript date', 'v':'', 'fieldtype':'group', 'group': [
      {'element':'ms_date_start_mod', 'label':'Start', 'v':'', 'fieldtype':'list', 'options':{'0':'','1':'Early','2':'Mid','3':'Late'}},
      {'element':'ms_date_start', 'label':'', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'ms_date_end_mod', 'label':'End', 'v':'', 'fieldtype':'list', 'options':{'0':'','1':'Early','2':'Mid','3':'Late'}},
      {'element':'ms_date_end', 'label':'', 'v':'', 'fieldtype':'text', 'options':''}

    ]},  //date/range
    {'element':'ms_date_note', 'label':'Manuscript date note', 'v':'', 'fieldtype':'text', 'options':''}, //text
    {'element':'extent', 'label':'Extent', 'v':'', 'fieldtype':'text', 'options':''},  //formula
    {'element':'completion', 'label':'State of completion', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'resource', 'label':'Resource', 'v':'', 'fieldtype':'text', 'options':''}  // url and isbn
  ]

  // Bootstrap the application
  bootstrap();

  // On any click, update the object with the most recent form info
  $('#kmw').on('click', 'input', function(){
    // Don't overwrite fields if we're doing a lookup
    if ($('#kmw-fields').hasClass('editing')) {
      dataUpdate();

      // Submit an upsert if we have a manuscript id
      if ($('#kmw-val-mid').val() !== '') {
        submitEdit($('#kmw-val-mid').val());
      }
    }

  });

  $('#kmw').on('click', '#kmw-find', function(event){
    var m_id = $('#kmw-val-mid').val()
    var m_name = $('#kmw-val-name').val()
    var m_shelfmark = $('#kmw-val-shelfmark').val()

    // remove the form fields and replace with the 'edit' group
    $('#kmw-fields .form-group').remove();

    editForm();
    submitLookup(m_id);
  });
  $('#kmw').on('click', '#kmw-clear', function(event){

    formReset();
    dataUpdate();
    clearFeedback();

    // remove the form fields and replace with the 'edit' group
    $('#kmw-fields .form-group').remove();
    lookupForm();
  });
});


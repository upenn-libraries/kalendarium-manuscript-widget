$(document).ready(function(){
  //@remote
  var kmw_url_target = 'http://kalendarium-manuscripts.herokuapp.com'
  // @todo - add check to make sure it's up before we do anything

  //@local
  is_local = window.location.search.substring(1).split('&')
  if (is_local[0] == "local=true") {
    console.log('Using local app')
    kmw_url_target = 'http://localhost:5000';
  }

  window.kmwBootstrap = function() {
    var elements = $.kmw

    // @todo change to display title at top
    $form = $('<form id="kmw" role="form"><h1>Manuscript Lookup</h1><div id="kmw-messages" class="alert"></div><div id=kmw-fields></div><input type="button" id="kmw-clear" class="btn btn-default" value="Clear" /></form>');

    // Add the form to the expected container
    $('#kmw-container').append($form);
    //@todo known: add new disappears when clearing from the edit form
    $('#kmw-fields').after('<input type="button" id="kmw-add" class="btn btn-default" value="Add New" />');
    // Set the lookup form as the default form field group
    kmwLookupForm();
  }

  window.kmwBrowseForm = function(elements) {
    $('#kmw-fields').hide()
    var listTable = $('<table id="kmw-browse" class="table"><th>ID</th><th>Name</th><th>Shelfmark</th></table>')
    for (var i = 0; i < elements.length; i++) {
      var manuscript = '<tr><td><a href="#" class="kmw-lookup-link" data-mid=' + elements[i].mid + '>' + elements[i].mid + '</a></td><td>'+ elements[i].name + '</td><td>' + elements[i].shelfmark + '</td></tr>';
      listTable.append(manuscript);
    }
    $('#kmw-fields').after(listTable)
    //@todo need pager

  }

  window.kmwLookupForm = function() {
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

   // $('#kmw-fields').after('<input type="button" id="kmw-add" class="btn btn-default" value="Add New" />');

  }

  window.kmwEditForm = function() {
    $('#kmw-fields').removeClass('lookup');
    $('#kmw-fields').addClass('editing');
    $('#kmw-add').remove();

    var elements = $.kmw

    // append each field to the form
    $(elements).each(function() {
      $this = $(this);

      // Wrap each collection field for bootstrap
      var $formElement = $('<div class="form-group"></div>');

      if ($this[0].label.length > 0) {
        var $elementLabel = $('<label class="control-label" for="#kmw-val-' + $this[0].element + '">' + $this[0].label + '</label>');
      }

      // Add a basic input field object
      if ($this[0].fieldtype === 'text') {
        var $elementContainer = $('<div class=""><input type="textfield" class="form-control" id="kmw-val-' + $this[0].element + '"></div>');

      // Add a hidden field input object
      } else if ($this[0].fieldtype === 'hidden') {
        var $elementContainer = $('<div class=""><input type="hidden" class="form-control" id="kmw-val-' + $this[0].element + '"></div>');

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

          } else if ($(this)[0].fieldtype === 'hidden') {
            var subfield = $('<input type="hidden" class="form-control" id="kmw-val-' + $(this)[0].element + '">');
            $($elementContainer).find('#kmw-val-' + groupId).append(subfield)

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
  window.kmwSubmitLookup = function(m_id, m_name, m_shelfmark) {
    var lookup_obj = new Object();
    lookup_obj['name'] = m_name
    lookup_obj['shelfmark'] = m_shelfmark

    var post_string = JSON.stringify(lookup_obj);

    kmwDataReset()
    kmwFormReset()
    $.ajax({
      url: kmw_url_target + '/api/manuscript/' + m_id,
      type: 'POST',
      data: post_string,
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
              else {
                if ($.kmw[i].group) {

                  for (var c = 0; c < $.kmw[i].group.length; c++) {
                    if ($.kmw[i].group[c].element == key) {
                      $.kmw[i].group[c].v = value
                    }
                  }
                }
              }

            };
          })

          // if submitted with the ID, then we know it's unique.
          // remove the form fields and replace with the 'edit' group
          $('#kmw-fields .form-group').remove();
          kmwEditForm()

          kmwClearFeedback()
          $('#kmw-val-mid').closest('.form-group').addClass('has-success has-feedback')
          kmwFormUpdate()
        }
        else {
          kmwClearFeedback()
          $('#kmw-clear').click()
          if (data.length > 0) {
            // return a list of matching manuscripts
            kmwBrowseForm(data); // submit array/obj containing m's

          } else {
            $('#kmw-val-mid').closest('.form-group').addClass('has-error has-feedback')
            $('#kmw-messages').addClass('alert-warning').text("Did not find manuscript " + m_id)
          }
        }
      }
    });
  }

  // Get a new unique manuscript ID from the service
  window.kmwSubmitAdd = function() {

    // Submit a lookup to get a new unique manuscript ID
    $.ajax({
      url: kmw_url_target + '/api/manuscript/add',
      dataType: 'json',
      crossDomain: true,
      success: function(data)
      {
        // remove the form fields and replace with the 'edit' group
        $('#kmw-fields .form-group').remove();
        $["kmw"][0]["v"] = data.m_id //@todo FIX ME
        kmwEditForm();
        kmwFormUpdate();
        //console.log('return' , data)
      },
      error: function(data)
      {
        //console.log('problem', data)
      }
    });
  }

  window.kmwSubmitEdit = function(m_id) {
    var post_obj = new Object();
    for (var i = 0; i < $.kmw.length; i++) {
      if ($.kmw[i].group) {

        for (var c = 0; c < $.kmw[i].group.length; c++) {

          post_obj[$.kmw[i].group[c].element] = $.kmw[i].group[c].v
        }

      } else {
        post_obj[$.kmw[i].element] = $.kmw[i].v
      }
    };

    var post_string = JSON.stringify(post_obj);

    $.ajax({
      url: kmw_url_target + '/api/manuscript/' + m_id + '/edit',
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
  window.kmwFormReset = function() {
    // reset form values
    $('#kmw-fields input').not('#kmw-find').each(function(){
      $(this).val('')
    })

    // All select element zero values are default
    $('#kmw-fields select').find("option[value='0']").attr("selected","selected");
  }

  window.kmwFormUpdate = function(data) {
    kmwFormReset();

    $('#kmw-fields input,#kmw-fields select').each(function(){
      // get key from id
      element_name = $(this).attr("id").substr(8)

      for (var i = 0; i < $.kmw.length; i++) {
        if ($["kmw"][i]["element"] == element_name) {
          $(this).val($["kmw"][i]["v"])
        }
        else {
          if ($.kmw[i].group) {
            for (var c = 0; c < $.kmw[i].group.length; c++) {
              if ($.kmw[i].group[c].element == element_name) {

                $(this).val($.kmw[i].group[c].v)

              }
            }
          }
        }
      };
    })

  }

  window.kmwDataReset = function() {
    for (var i = 0; i < $.kmw.length; i++) {
      $["kmw"][i]["v"] = ''
    };
  }

  window.kmwDataUpdate = function() {
    // get input fields
    $('#kmw-fields input,#kmw-fields select').each(function(){
      // get key from id
      element_name = $(this).attr("id").substr(8)

      for (var i = 0; i < $.kmw.length; i++) {

        if ($["kmw"][i]["element"] == element_name) {
          $["kmw"][i]["v"] = $(this).val()
        }
        else {
          if ($.kmw[i].group) {
            for (var c = 0; c < $.kmw[i].group.length; c++) {
              if ($.kmw[i].group[c].element == element_name) {

                $.kmw[i].group[c].v = $(this).val()

              }
            }
          }
        }
      };
    })

  }

  window.kmwClearFeedback = function() {
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
    // Search / lookup elements
    {'element':'mid', 'v':'', 'label':'ID', 'fieldtype':'text'},
    {'element':'name', 'label':'Name', 'v':'', 'fieldtype':'text'},
    {'element':'shelfmark', 'label':'Shelfmark', 'v':'', 'fieldtype':'text'},

    // Calendar elements
    {'element':'is_integral', 'label':'Is the calendar integral?', 'v':'', 'fieldtype':'list', 'options':{'1':'Yes','0':'No'}},
    {'element':'grading', 'label':'Grading (Weight)', 'fieldtype':'group', 'group':[
      {'element':'grade_black', 'label':'Black/Brown', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}},
      {'element':'grade_blue', 'label':'Blue', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}},
      {'element':'grade_green', 'label':'Green', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}},
      {'element':'grade_pink', 'label':'Pink', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}},
      {'element':'grade_red', 'label':'Red', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}},
      {'element':'grade_purple', 'label':'Purple', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}},
      {'element':'grade_gold', 'label':'Gold', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7'}}
    ]},

    {'element':'shading', 'label':'Has shading?', 'v':'', 'fieldtype':'list', 'options':{'1':'Yes','0':'No'}},
    {'element':'folio_sides', 'label':'Folio Sides', 'v':'', 'fieldtype':'group', 'group': [
      {'element':'folio_start_num', 'label':'Start', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'folio_start_side', 'label':'', 'v':'', 'fieldtype':'list', 'options':{'':'','r':'r','v':'v'}},
      {'element':'folio_end_num', 'label':'End', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'folio_end_side', 'label':'', 'v':'', 'fieldtype':'list', 'options':{'':'','r':'r','v':'v'}},

    ]},
    {'element':'columns', 'label':'Columns', 'fieldtype':'group', 'group': [
      {'element':'cal_col_1', 'label':'1', 'v':'', 'fieldtype':'list', 'options':{'':'','number':'Golden Number','letter':'Dominical Letter','kni':'Kalends, Nones, Ides','day':'Roman Day','text':'Text'}},
      {'element':'cal_col_2', 'label':'2', 'v':'', 'fieldtype':'list', 'options':{'':'','number':'Golden Number','letter':'Dominical Letter','kni':'Kalends, Nones, Ides','day':'Roman Day','text':'Text'}},
      {'element':'cal_col_3', 'label':'3', 'v':'', 'fieldtype':'list', 'options':{'':'','number':'Golden Number','letter':'Dominical Letter','kni':'Kalends, Nones, Ides','day':'Roman Day','text':'Text'}},
      {'element':'cal_col_4', 'label':'4', 'v':'', 'fieldtype':'list', 'options':{'':'','number':'Golden Number','letter':'Dominical Letter','kni':'Kalends, Nones, Ides','day':'Roman Day','text':'Text'}},
      {'element':'cal_col_5', 'label':'5', 'v':'', 'fieldtype':'list', 'options':{'':'','number':'Golden Number','letter':'Dominical Letter','kni':'Kalends, Nones, Ides','day':'Roman Day','text':'Text'}}
    ]},

    // The Shared Canvas maifest ID for this calendar
    {'element':'sc_cal_manifest_id', 'label': '', 'v':'', 'fieldtype':'hidden', 'options':''},

    // General manuscript elements
    {'element':'mtype', 'label':'Book Type', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'ms_or_print', 'label':'Manuscript or Print', 'v':'', 'fieldtype':'list', 'options':{'0':'Unknown','manuscript':'Manuscript','print':'Print'}},
    {'element':'language', 'label':'Language', 'v':'', 'fieldtype':'text', 'options':''}, //list?
    {'element':'origin', 'label':'Origin / Place', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'origin_note', 'label':'Origin Note', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'destination', 'label':'Destination', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'destination_note', 'label':'Destination note', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'script', 'label':'Script', 'v':'', 'fieldtype':'text', 'options':''},

    // height x width x depth
    // @todo limited to .5 cm
    {'element':'tb_dimensions', 'label':'Text block dimensions (mm)', 'fieldtype':'group', 'group': [
      {'element':'tb_dim_height', 'label':'H', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'tb_dim_width', 'label':'W', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'tb_dim_depth', 'label':'D', 'v':'', 'fieldtype':'text', 'options':''}
    ]},

     // heigh x width
     // @todo limited to .5 cm
    {'element':'ws_dimensions', 'label':'Writing Surface (mm)', 'fieldtype':'group', 'group': [
      {'element':'ws_dim_height', 'label':'H', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'ws_dim_width', 'label':'W', 'v':'', 'fieldtype':'text', 'options':''}
    ]},

    // Dates are a set of dropdowns that provide [modifier][year] - [modifier][year]
    {'element':'ms_date', 'label':'Manuscript date', 'v':'', 'fieldtype':'group', 'group': [
      {'element':'ms_date_start_mod', 'label':'Start', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'Early','2':'Mid','3':'Late'}},
      {'element':'ms_date_start', 'label':'', 'v':'', 'fieldtype':'text', 'options':''},
      {'element':'ms_date_end_mod', 'label':'End', 'v':'', 'fieldtype':'list', 'options':{'':'','1':'Early','2':'Mid','3':'Late'}},
      {'element':'ms_date_end', 'label':'', 'v':'', 'fieldtype':'text', 'options':''}
    ]},
    {'element':'ms_date_note', 'label':'Manuscript date note', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'extent', 'label':'Extent', 'v':'', 'fieldtype':'text', 'options':''},  //formula
    {'element':'provenance', 'label':'Provenance', 'v':'', 'fieldtype':'text'},
    {'element':'completion', 'label':'State of completion', 'v':'', 'fieldtype':'text', 'options':''},
    {'element':'resource', 'label':'Resource', 'v':'', 'fieldtype':'text', 'options':''}  // url and isbn
  ]

  // Bootstrap the application
  kmwBootstrap();

  // On any click, update the object with the most recent form info
  $('#kmw').on('click', 'input', function(){
    // Don't overwrite fields if we're doing a lookup
    if ($('#kmw-fields').hasClass('editing')) {
      kmwDataUpdate();

      // Submit an upsert if we have a manuscript id
      if ($('#kmw-val-mid').val() !== '') {
        kmwSubmitEdit($('#kmw-val-mid').val());
      }
    }

  });

  $('#kmw').on('click', '#kmw-find', function(event){
    var m_id = $('#kmw-val-mid').val()
    var m_name = $('#kmw-val-name').val()
    var m_shelfmark = $('#kmw-val-shelfmark').val()

    // Submit the lookup, using m_id if we know it. If not, the function will
    // check the name and shelfmark values.
    kmwSubmitLookup(m_id, m_name, m_shelfmark);

  });

  $('#kmw').on('click', '.kmw-lookup-link', function(event){
    var m_id = $(this).attr('data-mid')
    console.log($(this).attr('data-mid'))
    $('#kmw-browse').remove()

    // Submit the lookup with the known unique ID
    kmwSubmitLookup(m_id, null, null);
    $('#kmw-fields').show()

  });

  $('#kmw').on('click', '#kmw-add', function(event){
    kmwSubmitAdd();
  });

  $('#kmw').on('click', '#kmw-clear', function(event){

    kmwFormReset();
    kmwDataUpdate();
    kmwClearFeedback();

    // remove the form fields and replace with the 'edit' group
    $('#kmw-fields .form-group').remove();
    $('#kmw-fields').show();
    // We don't need the browse table any more
    $('#kmw-browse').remove();
    kmwLookupForm();
  });
});


$(document).ready(function(){
  //@local
  //var url_target = 'http://localhost:5000';
  //@remote
  var url_target = 'http://kalendarium-manuscripts.herokuapp.com/'


  var bootstrap = function() {
    var elements = $.kmw

    $form = $('<form id="kmw" role="form"><h1>Manuscript Lookup</h1><div id="kmw-messages" class="alert"></div><div id=kmw-fields></div><input type="button" id="kmw-add" class="btn btn-default" value="Add" /><input type="button" id="kmw-clear" class="btn btn-default" value="clear" /></form>');
    $('#kmw-container').append($form);

    // append each field to the form
    $(elements).each(function() {
      $this = $(this);

      var $formElement = $('<div class="form-group"></div>');

      var $elementLabel = $('<label class="control-label" for="#kmw-val-' + $this[0].element + '">' + $this[0].label + '</label>');

      if ($this[0].fieldtype === 'text') {
        var $elementContainer = $('<div class=""><input type="textfield" class="form-control" id="kmw-val-' + $this[0].element + '"></div>');
      } else if ($this[0].fieldtype === 'list') {
        var $elementContainer = $('<div class=""><select class="form-control" id="kmw-val-' + $this[0].element + '"></select>');

        var elementOptions = '';

        $.each($this[0].options, function(key, val) {
          elementOptions +='<option value= ' + key + '>' + val + '</option>'
        })

        $elementContainer.find('select').append(elementOptions)
      }


      $formElement.append($elementLabel, $elementContainer);

      $('#kmw-fields').append($formElement)

    })
    // append the lookup button to the id field
    $('#kmw-val-mid').parent().addClass('input-group');
    $('#kmw-val-mid').after('<span class="input-group-btn"><input type="button" id="kmw-find" class="btn btn-default" value="Find" /></span>');
  }

  var submitLookup = function(m_id) {
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

    $('#kmw-fields select').find("option[value='0']").attr("selected","selected");
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
    //console.log('dataUpdated', $.kmw)
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

  var clearFeedback = function() {
    // remove feedback formatting
    $('#kmw-fields .has-feedback').removeClass('has-feedback')
    $('#kmw-fields .has-success').removeClass('has-success')
    $('#kmw-fields .has-error').removeClass('has-error')
    $('#kmw .alert-success').removeClass('alert-success')
    $('#kmw .alert-warning').removeClass('alert-warning')
    $('#kmw-messages').text('')
  }

    $.kmw = [
    {'element':'mid', 'v':'', 'label':'ID', 'fieldtype':'text'},
    {'element':'name', 'label':'Name', 'v':'', 'fieldtype':'text'}, // text
    {'element':'provenance', 'label':'Provenance', 'v':'', 'fieldtype':'text'},

    {'element':'shelfmark', 'label':'Shelfmark', 'v':'', 'fieldtype':'text'}, //text
    {'element':'mtype', 'label':'Book Type', 'v':'', 'fieldtype':'text', 'options':''},  // list
    {'element':'is_integral', 'label':'Is the calendar integral?', 'v':'', 'fieldtype':'list', 'options':{'1':'Yes','0':'No'}}, //bool
    {'element':'ms_or_print', 'label':'Manuscript or Print', 'v':'', 'fieldtype':'list', 'options':{'0':'Unknown','manuscript':'Manuscript','print':'Print'}}, //bool
    {'element':'language', 'label':'Language', 'v':'', 'fieldtype':'text', 'options':''}, //list?
    {'element':'origin', 'label':'Origin / Place', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'origin_note', 'label':'Origin Note', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'destination', 'label':'Destination', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'destination_note', 'label':'Destination note', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'script', 'label':'Script', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'dimensions', 'label':'Physical Dimensions', 'v':'', 'fieldtype':'text', 'options':''},  //comp
    {'element':'tb_size', 'label':'Text block size', 'v':'', 'fieldtype':'text', 'options':''}, //composite?
    {'element':'ms_date', 'label':'Manuscript date', 'v':'', 'fieldtype':'text', 'options':''},  //date/range
    {'element':'ms_date_note', 'label':'Manuscript date note', 'v':'', 'fieldtype':'text', 'options':''}, //text
    {'element':'extent', 'label':'Extent', 'v':'', 'fieldtype':'text', 'options':''},  //formula
    {'element':'completion', 'label':'State of completion', 'v':'', 'fieldtype':'text', 'options':''},  //text
    {'element':'resource', 'label':'Resource', 'v':'', 'fieldtype':'text', 'options':''}  // url and isbn
  ]

  bootstrap();

  // On any click, update the object with the most recent form info
  $('#kmw').on('click', 'input', function(){
    // Don't overwrite fields if we're doing a lookup
    if ($(this).attr('id') !== 'kmw-find' && $(this).attr('id') !== 'kmw-clear' ) {
      dataUpdate();

      // Submit an upsert if we have a manuscript id
      if ($('#kmw-val-mid').val() !== '') {
        submitEdit($('#kmw-val-mid').val());
      }
    }
  });

  $('#kmw').on('click', '#kmw-find', function(event){
    submitLookup($('#kmw-val-mid').val());
  });
  $('#kmw').on('click', '#kmw-clear', function(event){
    formReset();
    dataUpdate();
    clearFeedback();
  });


});


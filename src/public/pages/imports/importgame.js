$(function() {
  loadNavBar();

  var dragAndDropAvailable = isModernBrowser();
  $("#proceed").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#step1").hide();
    $("#step2").show();
  });

  $("#back").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#step2").hide();
    $("#step1").show();
  });

  $(".box").each(function() {
    var $form = $(this),
      $input = $form.find('input[type="file"]'),
      $label = $form.find("label"),
      $errorMsg = $form.find(".box__error span"),
      $restart = $form.find(".box__restart"),
      droppedFiles = false,
      showFiles = function(files) {
        droppedFiles = files;
        let labelText = "";
        if (files.length > 1) {
          labelText = ($input.attr("data-multiple-caption") || "").replace("{count}", files.length);
        } else if (files.length === 1) {
          labelText = files[0].name;
        }

        $label.text(labelText);
      };

    // letting the server side to know we are going to make an Ajax request
    $form.append('<input type="hidden" name="ajax" value="1" />');

    // on file select
    $input.on("change", function(e) {
      showFiles(e.target.files);
    });

    // drag&drop files if the feature is available
    if (dragAndDropAvailable) {
      $form
        .addClass("has-advanced-upload") // letting the CSS part to know drag&drop is supported by the browser
        .on("drag dragstart dragend dragover dragenter dragleave drop", function(e) {
          // preventing the unwanted behaviours
          e.preventDefault();
          e.stopPropagation();
        })
        .on("dragover dragenter", function() //
        {
          $form.addClass("is-dragover");
        })
        .on("dragleave dragend drop", function() {
          $form.removeClass("is-dragover");
        })
        .on("drop", function(e) {
          showFiles(e.originalEvent.dataTransfer.files); // the files that were dropped
        });
    }

    // if the form was submitted

    $("#saveBtn").on("click", function(e) {
      // preventing the duplicate submissions if the current one is in progress
      if ($form.hasClass("is-uploading")) return false;
      const recordType = $("input[name='optradio']:checked").val();
      if (!recordType) {
        alert("Tell the system whether you're uploading quiz or vote data");
        return false;
      }
      if (!droppedFiles) {
        alert("No file selected");
        return false;
      }
      if (dragAndDropAvailable) {
        // ajax file upload for modern browsers
        e.preventDefault();

        const file = droppedFiles[0];
        $form.addClass("is-uploading").removeClass("is-error");

        const quizOrSurvey = {};
        const questions = [];
        const columns = [];

        let rowNumber = 0;
        try {
          Papa.parse(file, {
            step: function(row, parser) {
              const rowData = row.data[0];
              switch (rowNumber) {
                case 0: // Quiz Columns
                case 3: // Question Columns
                  for (let column of rowData) {
                    if (column) {
                      column = column.replace(/\s/g, "");
                      columns.push(column);
                    }
                  }
                  break;
                case 1: // set quiz columns
                  for (let i = 0; i < columns.length; i++) {
                    quizOrSurvey[columns[i]] = rowData[i];
                  }
                  break;
                case 2: // reset columns to switch to question columns
                  columns.length = 0;
                  break;
                default:
                  let isValidRow = false;
                  for (const field of rowData) {
                    if (field) {
                      isValidRow = true;
                      break;
                    }
                  }
                  if (isValidRow) {
                    const question = {};
                    for (let i = 0; i < columns.length; i++) {
                      question[columns[i]] = rowData[i];
                    }
                    questions.push(question);
                  }
                  break;
              }
              rowNumber++;
            },
            error: function(error, file) {
              console.log("From Error: Error occurred while papa-parsing...");
              console.log(error);
              $form.removeClass("is-uploading");
              $form.addClass("is-error");
              $errorMsg.text(error.message);
            },
            complete: function(results) {
              try {
                quizOrSurvey.questions = questions;
                console.log("Complete: POSTing " + recordType);
                console.log(quizOrSurvey);

                var myUrl = `/api/user/${
                  recordType === "quiz" ? "quizzes" : "surveys"
                }/batchcreate`;
                myUrl = window.location.origin + myUrl;
                var token = localStorage.getItem("token");
                $.ajax({
                  headers: {
                    Authorization: "Bearer " + token
                  },
                  url: myUrl,
                  type: "post",
                  data: quizOrSurvey,
                  // cache: false,
                  // contentType: false,
                  // processData: false,
                  complete: function() {
                    $form.removeClass("is-uploading");
                  },
                  error: function(data) {
                    console.log(data);
                    $form.removeClass("is-uploading");
                    $form.addClass("is-error");
                    $errorMsg.text(data.statusText);
                  },
                  success: function(data) {
                    $form.addClass("is-success");
                    console.log(data);
                    window.location = `../${
                      recordType === "quiz" ? "quiz" : "vote"
                    }/details.html?id=${data.id}`;
                  }
                });
              } catch (error) {
                console.log("From Error: Error occurred while papa-parsing...");
                console.log(error);
                $form.removeClass("is-uploading");
                $form.addClass("is-error");
                $errorMsg.text(error.message);
              }
            }
          });
        } catch (e) {
          console.log("Error occurred while papa-parsing...");
          console.log(e);
          $form.removeClass("is-uploading");
          $form.addClass("is-error");
          $errorMsg.text(e.message);
        }
      } // fallback Ajax solution upload for older browsers
      else {
        alert("Browser not supported");
      }
    });

    // restart the form if has a state of error/success

    $restart.on("click", function(e) {
      e.preventDefault();
      $form.removeClass("is-error is-success");
      $input.trigger("click");
    });

    // Firefox focus bug fix for file input
    $input
      .on("focus", function() {
        $input.addClass("has-focus");
      })
      .on("blur", function() {
        $input.removeClass("has-focus");
      });
  });
});

var mysql = require('mysql');
var m = require('./model')

var model = {
  data: null,
  con: null
};

model.connect = (data, callback, error) => {
  model.data = data;
  m.connect(data, (con) => {
    model.con = con;
    callback(con);
  }, error)
}

model.reconnect = (callback, error) => {
  m.connect(model.data, (con) => {
    model.con = con;
    callback(con);
  }, error)
}

// test_block

model.getTestBlocksVersion = (callback, error) => {
  model.con.query('SELECT version FROM test_block GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTestBlocksVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTestBlocks = (blocks, callback, error) => {
  if (blocks.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in blocks ) {
    var block = blocks[i];

    values += '(' + block.id_block + ', ' + block.id_dvs_test + ', \'' + block.block + '\', \'' + block.doc + '\', \'' + block.style + '\', \'' + block.description + '\', ' + block.version + ')'

    if (i < blocks.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE block = VALUES(block), doc = VALUES(doc), style = VALUES(style), description = VALUES(description), version = VALUES(version)';

  model.con.query('INSERT INTO test_block (id_block, id_dvs_test, block, doc, style, description, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTestBlocks(blocks, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

// test_block_rel

model.getTestBlocksRelVersion = (callback, error) => {
  model.con.query('SELECT version FROM test_block_rel GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTestBlocksRelVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTestBlocksRel = (blocks, callback, error) => {
  if (blocks.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in blocks ) {
    var block = blocks[i];

    values += '(' + block.id_test + ', ' + block.id_block + ', ' + block.id_dvs_test + ', ' + block.percent + ', ' + block.version + ')'

    if (i < blocks.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE version = VALUES(version)';

  model.con.query('INSERT INTO test_block_rel (id_test, id_block, id_dvs_test, percent, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTestBlocksRel(blocks, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

// test_question

model.getTestQuestionsVersion = (callback, error) => {
  model.con.query('SELECT version FROM test_question GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTestQuestionVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTestQuestions = (questions, cycle, callback, error) => {
  if (questions.length == 0) {
    callback();
    return;
  }

  maxCycle = 10000;
  endCycle = false;
  questionsCycle = [];
  if (questions.length < maxCycle) {
    endCycle = true;
    questionsCycle = questions;
  } else {
    var min = (cycle * maxCycle);
    var max = ((cycle+1) * maxCycle);
    if (max > questions.length) {
      endCycle = true;
      max = questions.length;
    }
    questionsCycle = questions.slice(min, max)
  }

  values = '';

  for ( var i in questionsCycle ) {
    var question = questionsCycle[i];

    values += '(' + question.id_question + ',' + question.id_dvs_test + ',';
    values += question.id_photo + ',' +  mysql.escape(question.solution) + ',';
    values += mysql.escape(question.a) + ','  + mysql.escape(question.b) + ',';
    values += mysql.escape(question.c) + ',' + mysql.escape(question.d) + ',';
    values += mysql.escape(question.explanation) + ',' + mysql.escape(question.question);
    values += ',' + question.language + ',' + question.video + ',' + question.audio;
    values += ',' + question.sheet + ',' + question.version + ')';

    if (i < questionsCycle.length - 1) {
      values += ','
    }
  }

  if (questionsCycle.length == 0) {
    callback();
    return;
  }

  values += ' ON DUPLICATE KEY UPDATE id_photo = VALUES(id_photo), solution = VALUES(solution), a = VALUES(a), b = VALUES(b), c = VALUES(c), d = VALUES(d), explanation = VALUES(explanation), question = VALUES(question), language = VALUES(language), video = VALUES(video), audio = VALUES(audio), sheet = VALUES(sheet), version = VALUES(version)';

  model.con.query('INSERT INTO test_question (id_question, id_dvs_test, id_photo, solution, a, b, c, d, explanation, question, language, video, audio, sheet, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTestQuestions(questions, cycle, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    if (endCycle === false) {
      cycle++;
      model.updateTestQuestions(questions, cycle, callback, error);
    } else {
      callback();
    }
  });
}

// test_question_rel

model.getTestQuestionsRelVersion = (callback, error) => {
  model.con.query('SELECT version FROM test_question_rel GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTestQuestionsRelVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTestQuestionsRel = (questions, cycle, callback, error) => {
  if (questions.length == 0) {
    callback();
    return;
  }

  maxCycle = 10000;
  endCycle = false;
  questionsCycle = [];
  if (questions.length < maxCycle) {
    endCycle = true;
    questionsCycle = questions;
  } else {
    var min = (cycle * maxCycle);
    var max = ((cycle+1) * maxCycle);
    if (max > questions.length) {
      endCycle = true;
      max = questions.length;
    }
    questionsCycle = questions.slice(min, max)
  }

  if (questionsCycle.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in questionsCycle ) {
    var question = questionsCycle[i];

    values += '(' + question.id_test + ',' + question.id_question + ',' + question.id_dvs_test + ',';
    values += question.id_dvs_question + ',' + question.norder + ',' + question.version + ')';

    if (i < questionsCycle.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE version = VALUES(version)';

  model.con.query('INSERT INTO test_question_rel (id_test, id_question, id_dvs_test, id_dvs_question, norder, version ) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTestQuestionsRel(questions, cycle, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    if (endCycle === false) {
      cycle++;
      model.updateTestQuestionsRel(questions, cycle, callback, error);
    } else {
      callback();
    }
  });
}

// test

model.getTestsVersion = (callback, error) => {
  model.con.query('SELECT version FROM test GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTestBlocksVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTests = (tests, callback, error) => {
  if (tests.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in tests ) {
    var test = tests[i];

    values += '(' + test.id_test + ',' + test.id_dvs_test + ',' + mysql.escape(test.description) + ',' + mysql.escape(test.theme) + ',' + mysql.escape(test.difficult) + ',' + mysql.escape(test.style) + ',' + test.version + ')'

    if (i < tests.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE description = VALUES(description), theme = VALUES(theme), difficult = VALUES(difficult), style = VALUES(style), version = VALUES(version)';

  model.con.query('INSERT INTO test (id_test, id_dvs_test, description, theme, difficult, style, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTests(tests, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

// temary

model.getTemaryVersion = (callback, error) => {
  model.con.query('SELECT version FROM temary GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTemaryVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTemaries = (temaries, callback, error) => {
  if (temaries.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in temaries ) {
    var temary = temaries[i];

    values += '(' + temary.id_temary + ',' + temary.id_dvs_temary + ',' + mysql.escape(temary.description) + ',' + mysql.escape(temary.doc) + ',' + temary.version + ')'

    if (i < temaries.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE description = VALUES(description), doc = VALUES(doc), version = VALUES(version)';

  model.con.query('INSERT INTO temary (id_temary, id_dvs_temary, description, doc, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTemaries(temaries, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

// temary_theme

model.getTemaryThemeVersion = (callback, error) => {
  model.con.query('SELECT version FROM temary_theme GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTemaryThemeVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTemaryThemes = (themes, callback, error) => {
  if (themes.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in themes ) {
    var theme = themes[i];

    values += '(' + theme.id_temary + ',' + theme.id_theme + ',' + theme.id_dvs_temary + ',' + theme.norder + ',' + mysql.escape(theme.theme) + ',' + theme.version + ')'

    if (i < themes.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE theme = VALUES(theme), version = VALUES(version)';

  model.con.query('INSERT INTO temary_theme (id_temary, id_theme, id_dvs_temary, norder, theme, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTemaryThemes(themes, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

// temary_subtheme

model.getTemarySubthemeVersion = (callback, error) => {
  model.con.query('SELECT version FROM temary_subtheme GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTemarySubthemeVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTemarySubthemes = (subthemes, callback, error) => {
  if (subthemes.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in subthemes ) {
    var subtheme = subthemes[i];

    values += '(' + subtheme.id_theme + ',' + subtheme.id_subtheme + ',' + subtheme.id_dvs_temary + ',' + subtheme.norder + ',' + mysql.escape(subtheme.subtheme) + ',' + subtheme.version + ')'

    if (i < subthemes.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE subtheme = VALUES(subtheme), version = VALUES(version)';

  model.con.query('INSERT INTO temary_subtheme (id_theme, id_subtheme, id_dvs_temary, norder, subtheme, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTemarySubthemes(subthemes, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

// temary_subtheme_sheet

model.getTemarySubthemeSheetVersion = (callback, error) => {
  model.con.query('SELECT version FROM temary_subtheme_sheet GROUP BY version', (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.getTemarySubthemeSheetVersion(callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    var versions = [];
    for (var i in results) {
      versions.push(results[i].version);
    }

    callback(versions);
  });
}

model.updateTemarySubthemesSheets = (subthemeSheets, callback, error) => {
  if (subthemeSheets.length == 0) {
    callback();
    return;
  }

  values = '';

  for ( var i in subthemeSheets ) {
    var subthemeSheet = subthemeSheets[i];

    values += '(' + subthemeSheet.id_subtheme + ',' + subthemeSheet.id_sheet + ',' + subthemeSheet.id_dvs_temary + ',' + subthemeSheet.norder + ',' + subthemeSheet.version + ')'

    if (i < subthemeSheets.length - 1) {
      values += ','
    }
  }

  values += ' ON DUPLICATE KEY UPDATE version = VALUES(version)';

  model.con.query('INSERT INTO temary_subtheme_sheet (id_subtheme, id_sheet, id_dvs_temary, norder, version) VALUES ' + values, (e, results, fields) => {
    if (e) {
      if (e.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
        model.reconnect(() => {
          model.updateTemarySubthemesSheets(subthemeSheets, callback, error);
        }, error);
      } else {
        error(e);
      }
      return;
    }

    callback();
  });
}

module.exports = model;

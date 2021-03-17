var https = require('https');
var fs = require('fs');

var jlptLevel = 1;
var supersetId = jlptLevel;
var supersetDescription = `JLPT-N${jlptLevel} Vocabulary with the jlpt-n${jlptLevel} tag. Words and definitions are retrieved from Jisho.org's database.`

var cardAndSetIdStarts = [{},
    {
        cardIdStart: 1200,
        setIdStart: 100
    },
    {},
    {},
    {
        cardIdStart: 600,
        setIdStart: 50
    },
    {
        cardIdStart: 0,
        setIdStart: 0
    }
]

var allTypesGlobal = [
    `Noun`,
    `RuVerb`,
    `UVerb`,
    `IrregularVerb`,
    `Transitive`,
    `Intransitive`,
    `Other`,
    `NaAdjective`,
    `IAdjective`,
    `SpecialKuruVerb`,
    `SpecialSuruVerb`,
    `SpecialAruVerb`
];


function getJishoURL(page) {
    return {
        host: 'jisho.org',
        path: `/api/v1/search/words?keyword=jlpt-n${jlptLevel}&page=${page}`,
        method: 'GET'
    }
}

function getData(jishoURL) {
    return new Promise((resolve, reject) => {
        https.request(jishoURL, (res) => {
            var body = "";
            res.on('data', (chunk) => {
                body += chunk.toString('utf-8');
            });
            res.on('end', () => {
                resolve(JSON.parse(body)['data']);
            })
        }).on('error', function(e) {
            console.log('problem with request: ' + e.message);
            reject(null);
        }).end();
    })
}

async function getAllWords() {
    var data = [], pageNumber = 1, dataChunk;
    do {
        console.log('Fetching page', pageNumber)
        dataChunk = await getData(getJishoURL(pageNumber));
        data = data.concat(dataChunk);
        pageNumber ++;
    } while (dataChunk.length !== 0);
    data = JSON.stringify(data);
    fs.writeFileSync(`output-raw-jlpt-n${jlptLevel}.json`, data);
}

function writeToSQL() {
    var jlpts = new Set();
    var data = JSON.parse(fs.readFileSync(`output-raw-jlpt-n${jlptLevel}.json`)).filter(datum => {
        return !datum['jlpt'].some(jlptLevelInner => {
            jlpts.add(jlptLevelInner);
            return parseInt(jlptLevelInner.match(/\d/)[0]) < jlptLevel
        });
    });
    console.log(jlpts);
    var cardIdIncrement = 0, setIdIncrement = 0;

    var cards = [], wordTypes = [], sets = [], answers = [];

    data.forEach(datum => {
        if (cardIdIncrement % 20 === 0) {
            sets.push({
                Id: cardAndSetIdStarts[jlptLevel].setIdStart + setIdIncrement,
                SetName: `JLPT-N${jlptLevel} Part ${setIdIncrement + 1}`,
                SetOwner: 'global',
                SupersetId: supersetId
            })
            setIdIncrement++;
        }

        const currWordType = calculateWordType(datum['senses'][0]['parts_of_speech']);
        cards.push({
            Id: cardAndSetIdStarts[jlptLevel].cardIdStart + cardIdIncrement,
            SetId: cardAndSetIdStarts[jlptLevel].setIdStart + setIdIncrement - 1,
            WordType: currWordType.Id,
            Kanji: datum['japanese'][0]['word'] || datum['japanese'][0]['reading'],
            Furigana: datum['japanese'][0]['reading'],
            CardOwner: 'global'
        });

        datum['senses'][0]['english_definitions'].forEach(definition => {
            answers.push({
                Definition: definition,
                CardId: cardAndSetIdStarts[jlptLevel].cardIdStart + cardIdIncrement,
                Owner: 'global'
            });
        });

        if (wordTypes.findIndex(wordType => wordType.Id === currWordType.Id) === -1) {
            wordTypes.push(currWordType);
        }
        cardIdIncrement++;
    });

    cards = objectToSQL(cards, 'Card');
    wordTypes = objectToSQL(wordTypes, 'CardsWordtype', true);
    answers = objectToSQL(answers, 'EnglishDefinition');
    sets = objectToSQL(sets, 'Set');
    var superset = objectToSQL([{Id: supersetId, SupersetOwner: 'global', SupersetName: `JLPT-N${jlptLevel}`, SupersetDescription: `${supersetDescription}`, Picture: 'jishologo.png'}], 'Superset')
    var sqlData = `${superset};\n${sets};\n${wordTypes};\n${cards};\n${answers}`;
    [...sqlData.matchAll(/[^\n]*�+[^\n]*\n/g)].forEach(match => {
        console.error('INVALID SYMBOL: ', match[0]);
    });

    fs.writeFileSync(`output-JLPT-N${jlptLevel}.sql`, sqlData);
}

var unknownTypes = new Set();
function calculateWordType(allTypes) {
    var wordType = {}, id = 0;
    allTypesGlobal.forEach(type => {
        wordType[type] = false;
    });
    allTypes.forEach(type => {
        var typeId = allTypesGlobal.findIndex((typeGlobal) => type === typeGlobal);
        if (typeId === -1) {
            if (type === 'Ichidan verb') {
                typeId = 1;
            } else if (type === 'Transitive verb') {
                typeId = 4;
            } else if (type === 'intransitive verb') {
                typeId = 5;
            } else if (type === 'Suru verb') {
                typeId = 3;
            } else if (type === 'Na-adjective') {
                typeId = 7;
            } else if (type.includes('Godan verb') || type.includes('nu ending') || type.includes('nu verb')) {
                typeId = 2;
            } else if (type.toLowerCase().includes('noun')) {
                typeId = 0;
            } else if (type === 'I-adjective') {
                typeId = 8;
            } else if (type.includes('Kuru verb')) {
                typeId = 9;
            } else if (type.includes('Suru') && type.includes('irregular')) {
                typeId = 6;
            } else if (type === 'No-adjective') {
                return;
            }
        }
        if (typeId === -1) {
            if (!unknownTypes.has(type)) {
                unknownTypes.add(type);
                console.log(type);
            }
            return;
        }
        if (wordType[allTypesGlobal[typeId]] === false) {
            id += Math.pow(2, typeId)
        }
        wordType[allTypesGlobal[typeId]] = true;
    })
    wordType['Id'] = id;
    return wordType;
}

function objectToSQL(arrayObj, name, shouldIgnore = false) {
    var sqlInserts = `INSERT ${shouldIgnore ? 'IGNORE ' : ''}INTO japanese.${name}(${Object.keys(arrayObj[0]).join(',')}) VALUES `;
    sqlInserts += arrayObj.map(obj => 
       '(' + Object.keys(obj)
        .map(key => typeof obj[key] === 'string' ? obj[key].replace(/'/g, "\\'") : obj[key])
        .map(val => ((typeof val === 'string') ? ("'" + val + "'") : val))
        .join(',') + ')'
    ).join(',\n');
    return sqlInserts;
}

//getAllWords();
writeToSQL();

/*
  `Id` int NOT NULL,
  `SetId` int DEFAULT NULL,
  `WordType` int DEFAULT NULL,
  `Kanji` varchar(255) NOT NULL,
  `Furigana` varchar(255) NOT NULL,
  `CardOwner` varchar(255) DEFAULT NULL,
/*

   {
      "slug":"学校",
      "is_common":true,
      "tags":[
         "wanikani7"
      ],
      "jlpt":[
         "jlpt-n5"
      ],
      "japanese":[
         {
            "word":"学校",
            "reading":"がっこう"
         },
         {
            "word":"學校",
            "reading":"がっこう"
         }
      ],
      "senses":[
         {
            "english_definitions":[
               "school"
            ],
            "parts_of_speech":[
               "Noun"
            ],
            "links":[
               
            ],
            "tags":[
               
            ],
            "restrictions":[
               
            ],
            "see_also":[
               
            ],
            "antonyms":[
               
            ],
            "source":[
               
            ],
            "info":[
               
            ]
         },
         {
            "english_definitions":[
               "Gakkou"
            ],
            "parts_of_speech":[
               "Place"
            ],
            "links":[
               
            ],
            "tags":[
               
            ],
            "restrictions":[
               
            ],
            "see_also":[
               
            ],
            "antonyms":[
               
            ],
            "source":[
               
            ],
            "info":[
               
            ]
         },
         {
            "english_definitions":[
               "School"
            ],
            "parts_of_speech":[
               "Wikipedia definition"
            ],
            "links":[
               {
                  "text":"Read “School” on English Wikipedia",
                  "url":"http://en.wikipedia.org/wiki/School?oldid=491526576"
               },
               {
                  "text":"Read “学校” on Japanese Wikipedia",
                  "url":"http://ja.wikipedia.org/wiki/学校?oldid=42766206"
               }
            ],
            "tags":[
               
            ],
            "restrictions":[
               
            ],
            "see_also":[
               
            ],
            "antonyms":[
               
            ],
            "source":[
               
            ],
            "info":[
               
            ],
            "sentences":[
               
            ]
         }
      ],
      "attribution":{
         "jmdict":true,
         "jmnedict":true,
         "dbpedia":"http://dbpedia.org/resource/School"
      }
   },
*/
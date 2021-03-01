var https = require('https');
var fs = require('fs');

var jlptLevel = 5;
var cardIdStart = 0;
var setIdStart = 0;
var supersetId = jlptLevel;

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

//getAllWords();

function writeToSQL() {
    var data = JSON.parse(fs.readFileSync(`output-raw-jlpt-n${jlptLevel}.json`));
    var cardIdIncrement = 0, setIdIncrement = 0;

    var cards = [], wordTypes = [], sets = [], answers = [];

    data.forEach(datum => {
        calculateWordType(datum['senses'][0]['parts_of_speech']);
        /*cards.push({
            Id: cardIdStart + cardIdIncrement,
            SetId: setIdStart + setIdIncrement,
            WordType: calculateWordType(datum['senses'][0]['parts_of_speech']).Id,
            Kanji: datum['japanese'][0]['word'],
            Furigana: datum['japanese'][0]['reading'],
            CardOwner: 'global'
        });

        answers.push({

        })*/
    })
}

var unknownTypes = new Set();
function calculateWordType(allTypes) {
    var wordType = {}, id = 0;
    allTypesGlobal.forEach(type => {
        wordType[type] = 'false';
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
                typeId = 6;
            }
        }
        if (typeId === -1 && !unknownTypes.has(type)) {
            console.log(type);
            unknownTypes.add(type);
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

function objectToSQL() {

}

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
import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import Highlight from 'react-highlight';
import brain from 'brain.js';
import PorterStemmer from 'natural/lib/natural/stemmers/porter_stemmer';
import Tokenizer from 'natural/lib/natural/tokenizers/aggressive_tokenizer';
import Recognizer from 'mysam-ui/src/recognizer';

import Featurizer from './featurizer';
import { RecognizerButton, RecognizerForm } from './components';

const features = new Featurizer();

export function splash() {
  return <h1 className='animated fadeIn'>
    When AI makes mistakes
  </h1>;
}

export function about() {
  return <div className='animated fadeIn'>
    <img src='assets/profile.jpeg' alt='David Luecke' className='profile' />
    <h1>David Luecke</h1>
    <h2>
      <a href='https://twitter.com/daffl'>
        <i className='fa fa-twitter' />daffl
      </a>
      <a href='https://github.com/daffl'>
        <i className='fa fa-github' /> daffl
      </a>
    </h2>
    <a href='https://feathersjs.com'>
      <img src='assets/feathers-logo.png' alt='FeathersJS logo' />
    </a>
  </div>;
}

export function link() {
  return <a href='https://nina2017.mysamai.com'>
    nina2017.mysamai.com
  </a>;
}

export function iceland() {
  return <iframe src='https://www.youtube.com/embed/C1Hld-ONeFA?start=488&end=518&autoplay=1' frameBorder='0' allowFullScreen></iframe>;
}

export function speechRecognition() {
  const r = new Recognizer({
    continuous: true,
    interimResults: true
  });

  const Slide = observer(() => <div className='padded'>
    <h1>HTML5 can hear  you</h1>
    <RecognizerForm recognizer={r} />
    <Highlight className='js'>{
`var recognition = new webkitSpeechRecognition();
recognition.onresult = function(event) {
  console.log(event)
}
recognition.start();`
    }</Highlight>
  </div>);

  return <Slide />
}

export function brainjs() {
  const brain = require('brain.js');
  const net = new brain.NeuralNetwork();

  // [ R, G, B ]
  net.train([
    { input: [ 0.03, 0.7, 0.5 ], output: { dark: 1 } },
    { input: [ 0.16, 0.09, 0.2 ], output: { light: 1 } },
    { input: [ 0.5, 0.5, 1.0 ], output: { dark: 1 } }
  ]);

  return <div className='padded'>
    <h1>Neural Networks in JavaScript</h1>
    <Highlight className='js'>{
`const brain = require('brain.js');
const net = new brain.NeuralNetwork();

// [ R, G, B ]
net.train([
  { input: [ 0.03, 0.7, 0.5 ], output: { dark: 1 } },
  { input: [ 0.16, 0.09, 0.2 ], output: { light: 1 } },
  { input: [ 0.5, 0.5, 1.0 ], output: { dark: 1 } }
]);

var output = net.run([1, 0.4, 0 ]);
// ${JSON.stringify(net.run([1, 0.4, 0 ]))}`
    }</Highlight>
  </div>;
}

export function tokenize() {
  const r = new Recognizer();
  const Slide = observer(() => {
    const { text = '' } = r.transcript;

    const tokenized = new Tokenizer().tokenize(text.toLowerCase());

    return <div className='padded'>
      <h1>Tokenize</h1>
      <RecognizerForm recognizer={r} />
      <Highlight className='js'>{
`const tokens = new Tokenizer().tokenize('${text.toLowerCase()}');

${JSON.stringify(tokenized)}`
      }</Highlight>
    </div>;
  });

  return <Slide />;
}

export function stem() {
  const r = new Recognizer();
  const Slide = observer(() => {
    const { text = '' } = r.transcript;
    const sentence = text.toLowerCase();

    const stemmed = Featurizer.stem(sentence, false);
    const stemmedAll = Featurizer.stem(sentence, true);

    return <div className='padded'>
      <h1>Stem</h1>
      <p>Create the word stem for each token</p>
      <RecognizerForm recognizer={r} />
      <Highlight className='js'>{
`// All word stems
${JSON.stringify(stemmedAll)}

// Without stop words
${JSON.stringify(stemmed)}`
      }</Highlight>
    </div>;
  });

  return <Slide />;
}

export function combine() {
  const r = new Recognizer();
  const { sentences } = features;

  const Slide = observer(() => {
    const stemmedSentences = sentences.map(current => `
// ${current}
${JSON.stringify(Featurizer.stem(current))}
    `).join('');

    return <div className='padded'>
      <h1>Combine tokens</h1>
      <RecognizerForm recognizer={r} showSubmit
        onSubmit={text => sentences.push(text)} />
      <Highlight className='js'>{
`${stemmedSentences}
// Combined tokens
${JSON.stringify(features.combined)}`
      }</Highlight>
    </div>
  });

  return <Slide />;
}

export function featurize() {
  const Slide = observer(() => {
    const featurized = features.sentences.map(sentence => {
      const stem = Featurizer.stem(sentence);

return `// ${sentence}
${JSON.stringify(stem)}
${JSON.stringify(features.featurize(stem))}
`;
    }).join('\n');

    return <div className='padded'>
      <h1>Featurize</h1>
      <Highlight className='js'>{
`// Combined tokens
${JSON.stringify(features.combined)}

${featurized}`
      }</Highlight>
    </div>
  });

  return <Slide />;
}

export function train() {
  const Slide = observer(() => {
    const inputs = features.stems.map((tokens, index) => {
      const label = index % 2 ? 'bad' : 'good';
return `
  // ${JSON.stringify(tokens)}
  { input: ${JSON.stringify(features.featurize(tokens))}, output: { ${label}: 1 } }`
    });

    return <div className='padded'>
      <h1>Label and train</h1>
      <Highlight className='js'>{
`const brain = require('brain.js');
const net = new brain.NeuralNetwork();

net.train([${inputs.join(',\n')}
]);`
      }</Highlight>
    </div>;
  });

  return <Slide />
}

export function classify() {
  const r = new Recognizer();
  const net = new brain.NeuralNetwork();
  const trainings = features.stems.map((tokens, index) => {
    const label = index % 2 ? 'bad' : 'good';
    return {
      input: features.featurize(tokens),
      output: { [label]: 1 }
    };
  });

  net.train(trainings);

  const Slide = observer(() => {
    const { text = '' } = r.transcript;
    const stemmed = Featurizer.stem(text);
    const featurized = features.featurize(stemmed);

    return <div className='padded'>
      <h1>Classify</h1>
      <RecognizerForm recognizer={r} />
      <Highlight className='js'>{
`// ${JSON.stringify(features.combined)}
// ${JSON.stringify(stemmed)}

net.run(${JSON.stringify(featurized)})

${JSON.stringify(net.run(featurized), null, '  ')}`
      }</Highlight>
    </div>;
  });

  return <Slide />;
}

export function naturalBrain() {
  return <div className='padded'>
    <h1>natural-brain</h1>
    <p>A node-natural classifier using a brain.js neural network:</p>
    <Highlight className='js'>{
`const classifier = new require('natural-brain').BrainJSClassifier();

classifier.addDocument('my unit-tests failed.', 'software');
classifier.addDocument('tried the program, but it was buggy.', 'software');
classifier.addDocument('tomorrow we will do standup.', 'meeting');
classifier.addDocument('can you play some new music?', 'music');

classifier.train();

console.log(classifier.classify('did the tests pass?')); // -> software
console.log(classifier.classify('Lets meet tomorrow?')); // -> meeting
console.log(classifier.classify('Can you play some stuff?')); // -> music`
    }</Highlight>
  </div>
}

export function mysam() {
  return <div className='padded'>
    <h1>MySam</h1>
    <p>A trainable natural language processing API and extensible UI to create your own web-based digital assistant.</p>
    <p><a href='https://mysamai.com'>
      <img src='assets/mysam-logo.png' alt='MySam logo' />
    </a></p>
    <h2><a href='https://github.com/mysamai'>
        <i className='fa fa-github' /> mysamai
    </a></h2>
  </div>
}

export function summary() {
  return <div className='padded'>
    <h2><i>
      You don't always need huge datasets to build something useful
    </i></h2>
    <ul>
      <li>HTML5 speech recognition works quite well</li>
      <li>Neural networks are great for natural language processing</li>
    </ul>
  </div>;
}

export function coc() {
  return <div className='padded'>
    <h2><i>
      "Software that learns doesn't break, it makes mistakes"
    </i></h2>

    <img src='assets/slacklog.png' alt='Sadly the Robot assistant did not read the CoC :p' />
  </div>;
}

export function conclusion() {
  return <div className='padded'>
    <h1>Thank you!</h1>
    <ul>
      <li>{link()}</li>
      <li>
        <a href='https://twitter.com/daffl'>
          <i className='fa fa-twitter' />daffl
        </a>
        <a href='https://github.com/daffl'>
          <i className='fa fa-github' /> daffl
        </a>
        <a href='https://github.com/mysamai'>
          <i className='fa fa-github' /> mysamai
        </a>
      </li>
      <li>
        <a href='http://superscriptjs.com/'>
          SuperScriptJS
        </a>
        <a href='https://github.com/NaturalNode/natural'>
          node-natural
        </a>
        <a href='https://github.com/mysamai/natural-brain'>
          natural-brain
        </a>
        <a href='https://github.com/brainjs'>
          brain.js
        </a>
      </li>
      <li>
        <a href='https://openai.com/'>
          OpenAI
        </a>
        <a href='https://jasperproject.github.io/'>
          Jasper
        </a>
        <a href='http://sirius.clarity-lab.org/'>
          Sirius
        </a>
      </li>
    </ul>
  </div>;
}

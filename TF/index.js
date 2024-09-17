const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const Alexa = require('ask-sdk');

// Criar um cliente do DynamoDB
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });  // Substitua pela região que está usando
const dynamo = DynamoDBDocument.from(dynamoDBClient);


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput  
 = 'Bem-vindo ao Relatório Aedes. Você pode perguntar sobre o alerta ou epidemia em uma cidade específica. Como posso ajudar?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('Diga o nome de uma cidade para obter o nível de alerta ou epidemia.')
      .getResponse();
  },
};

// Handler para Epidemia e Alerta Intent
const EpidemiaAlertaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
            (Alexa.getIntentName(handlerInput.requestEnvelope) === 'EpidemiaIntent' ||
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'AlertaIntent');
    },
    async handle(handlerInput) {
        let cidade = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Cidade');
        console.log('Cidade capturada antes de formatar:', cidade);

        if (!cidade) {
            const speakOutput = 'Desculpe, você não mencionou o nome de um município. Por favor, tente novamente.';
            console.log('Cidade não fornecida:', speakOutput);
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }

        // Capitaliza o nome da cidade
        cidade = capitalizeCityName(cidade);
        console.log('Cidade após formatação:', cidade);

        const params = {
            TableName: 'arboviroses',
            Key: { "municipio": cidade }
        };

        try {
            console.log('Consultando tabela "arboviroses" no DynamoDB:', params);
            const data = await dynamo.get(params);

            let speakOutput;

            if (!data.Item) {
                speakOutput = `O município ${cidade} não está em alerta nem em epidemia.`;
                console.log('Nenhum dado encontrado para o município:', cidade);
            } else {
                const nivel = data.Item.nivel;
                speakOutput = gerarMensagemAlerta(cidade, nivel);
                console.log('Dados encontrados na tabela "arboviroses" para o município:', data.Item);
            }

            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        } catch (error) {
            console.error('Erro ao consultar o DynamoDB:', error);
            return handlerInput.responseBuilder.speak('Desculpe, houve um problema ao acessar os dados. Tente novamente mais tarde.').getResponse();
        }
    }
};

// Função para capitalizar o nome da cidade corretamente
function capitalizeCityName(cidade) {
    const lowercaseWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'para', 'por', 'no', 'na', 'nos', 'nas', 'em', 'com'];

    return cidade
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            if (lowercaseWords.includes(word) && index !== 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

// Função para gerar a mensagem de alerta com base no nível
function gerarMensagemAlerta(cidade, nivel) {
    let mensagem = '';

    if (nivel == 1) {
        mensagem = `O município ${cidade} está com nível de alerta ${nivel}. A situação está sob controle, mas ações preventivas podem ser tomadas para evitar a dengue. Algumas sugestões são: eliminar focos de água parada, manter a limpeza de quintais e evitar o acúmulo de lixo.`;
    } else if (nivel == 2 || nivel == 3) {
        mensagem = `O município ${cidade} está com nível de alerta ${nivel}. Os casos de dengue estão em níveis preocupantes de pré-epidemia. É importante tomar ações imediatas, como eliminar possíveis criadouros de mosquitos, utilizar repelente e cobrir reservatórios de água.`;
    } else if (nivel == 4) {
        mensagem = `O município ${cidade} está em nível 4 de epidemia. A situação é grave e requer ações imediatas. Recomendamos buscar orientação das autoridades de saúde locais, intensificar o combate aos criadouros de mosquitos e garantir que todas as medidas de prevenção sejam seguidas rigorosamente.`;
    } else {
        mensagem = `O município ${cidade} está com nível de alerta ${nivel}. A situação está sob controle, mas ações preventivas podem ser tomadas para evitar a dengue. Algumas sugestões são: eliminar focos de água parada, manter a limpeza de quintais e evitar o acúmulo de lixo.`;
    }

    return mensagem;
}

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Até breve!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        EpidemiaAlertaIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)   
    .lambda();
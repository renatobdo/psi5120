# Tópicos em Computação em Nuvem - PSI5120

Andras Horacio Cassimo

Renato Bueno Domingos de Oliveira - NUSP:12219799

Victor Soares Braz


### Vídeo:

https://youtu.be/CjJ2TRG69VQ 

### Trabalho Final
Implementar uma aplicação fim a fim envolvendo um dispositivo embarcado IoT, uma plataforma de IoT,
um banco de dados e uma interface com o usuário por voz

### Objetivo geral
Aplicação fim a fim para monitoramento da dengue

### Objetivos específicos

- Coleta de dados da API do info dengue
- Simulação de dispositivo IoT com o envio de dados via Mqtt para banco de dados dynamoDB na nuvem
- Função lambda para integração com alexa
- Informes sobre os municípios com epidemia de dengue e medidas de combate e prevenção

### Arquitetura

![DengueStatus-PSI5120](https://github.com/user-attachments/assets/e7a1c3e2-583c-456c-b5fc-f5e14ac4eafa)


### Discussão

Os dados das arboviroses (dengue, zika e chikungunya) são coletados da API infodengue
em: 
- https://api.mosqlimate.org/docs/datastore/GET/infodengue/ 
- Os parâmetros passados para a coleta dos dados são:
  - disease = dengue
  - semana inicial
  - semana final 
  - uf=SP

    Exemplo: https://api.mosqlimate.org/api/datastore/infodengue/?disease=dengue&start=2024-09-08&end=2024-09-14&per_page=300&UF=SP%27
   
- O SINAN (sistema de informação de agravos de notificação) define as semanas epidemiológicas que são 52 conforme site:
  -  http://portalsinan.saude.gov.br/calendario-epidemiologico?layout=edit&id=173. 
  -  Por exemplo, a semana 1 de 2024 foi de 31/12/2023 a 06/01/2024, a semana 2  de 07/01/2024 a 13/01/2024, começando em um domingo e finalizando em um sábado. 

- A URL de requisição pode ser visualizada no código python que foi utilizado para simulação de um dispositivo IoT, assim como a publicação e envio dos dados via mqtt.  O código foi chamado de iotDeviceSimulator.py:

```Python
import requests
import time
import paho.mqtt.client as mqtt
import ssl
import json
from datetime import datetime, timedelta

# Configurações MQTT
mqtt_broker = "a1kfhnlxu9hcqk-ats.iot.us-east-1.amazonaws.com"
port = 8883
topic = "arbovirus/alertas"  # Defina o tópico desejado

# Caminhos dos certificados e chaves
ca_path = r"C:\Users\renat\Downloads\AmazonRootCA1(5).pem"
cert_path = r"C:\Users\renat\Downloads\07ddc7aee7d10569d889238b27c1227ed1ee8c3a75fc796c6b9d5edf17a5de6e-certificate.pem.crt"
key_path = r"C:\Users\renat\Downloads\07ddc7aee7d10569d889238b27c1227ed1ee8c3a75fc796c6b9d5edf17a5de6e-private.pem.key"

# Função de callback para conexão MQTT
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Conectado ao broker MQTT com sucesso.")
    else:
        print(f"Falha na conexão. Código de retorno: {rc}")

# Função de callback para quando a mensagem é publicada
def on_publish(client, userdata, mid):
    print(f"Mensagem {mid} publicada com sucesso.")

# Configurar cliente MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_publish = on_publish

# Configurar SSL/TLS para a conexão segura
client.tls_set(ca_certs=ca_path, certfile=cert_path, keyfile=key_path,
               cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)
client.tls_insecure_set(False)

# Conectar ao broker MQTT (AWS IoT Core)
client.connect(mqtt_broker, port=port)

# Iniciar o loop do cliente MQTT
client.loop_start()

# Gerar as semanas epidemiológicas para 2024
def gerar_semanas_epidemiologicas(ano):
    # Encontrar o primeiro domingo do ano
    data_inicio = datetime(ano, 1, 1)
    while data_inicio.weekday() != 6:  # O método .weekday() retorna 6 para domingo
        data_inicio += timedelta(days=1)

    semanas = []
    semana_numero = 1

    # Gerar semanas até o final do ano
    while data_inicio.year == ano:
        inicio_semana = data_inicio
        fim_semana = inicio_semana + timedelta(days=6)

        semanas.append({
            "semana": semana_numero,
            "inicio": inicio_semana.strftime("%Y-%m-%d"),
            "fim": fim_semana.strftime("%Y-%m-%d")
        })

        # Avançar para a próxima semana
        data_inicio += timedelta(days=7)
        semana_numero += 1

    return semanas

# Encontrar a semana epidemiológica atual
def encontrar_semana_epidemiologica_atual(semanas):
    data_atual = datetime.now()
    for semana in semanas:
        inicio_semana = datetime.strptime(semana["inicio"], "%Y-%m-%d")
        fim_semana = datetime.strptime(semana["fim"], "%Y-%m-%d")
        if inicio_semana <= data_atual <= fim_semana:
            return semana
    return None

# Definir as semanas epidemiológicas de 2024
semanas_epidemiologicas_2024 = gerar_semanas_epidemiologicas(2024)

# Encontrar a semana atual
semana_atual = encontrar_semana_epidemiologica_atual(semanas_epidemiologicas_2024)

def fetch_all_results(start, end, max_pages=None):
    page = 1
    total_records = 0

    while True:
        url = f"https://api.mosqlimate.org/api/datastore/infodengue/?disease=dengue&start={start}&end={end}&page={page}&limit=300&uf=SP"
        print(f"Fazendo requisição para a página {page}: {url}")

        response = requests.get(url)

        if response.status_code != 200:
            print(f"Erro na requisição: {response.status_code}")
            break

        data = response.json()

        # Verificar quantos registros foram obtidos na página atual
        page_records = len(data['items'])

        # Publicar os resultados via MQTT
        print(f"Publicando {page_records} registros da página {page}")
        total_records += page_records
        
        # Publicar os resultados no tópico MQTT
        processar_resultados(data['items'])

        # Se a quantidade de registros for menor que o limite, não há mais páginas
        if page_records < 300:
            break

        # Incrementar a página para pegar a próxima
        page += 1

        # Limitar a quantidade de páginas (opcional, apenas para controle de grandes volumes)
        if max_pages and page > max_pages:
            print(f"Interrompido após {max_pages} páginas.")
            break

        # Delay entre requisições (opcional, dependendo da API)
        time.sleep(1)

    return total_records

def processar_resultados(resultados):
    # Publicar cada resultado via MQTT em formato JSON com o payload fornecido
    for entry in resultados:
        try:
            # Construir o payload com base nos dados recebidos
            payload = {
                "municipio": entry.get("municipio_nome"),
                "se": entry.get("SE"),
                "umidade_media": entry.get("umidmed"),
                "temperatura_media": entry.get("tempmed"),
                "incidencia": entry.get("p_inc100k"),
                "nivel": entry.get("nivel")
            }

            # Converter o payload em JSON para enviar via MQTT
            payload_json = json.dumps(payload)
            result = client.publish(topic, payload_json, qos=1)  # Publica a mensagem com QoS 1
            result.wait_for_publish()  # Espera até a mensagem ser publicada
            print(f"Publicado: {payload_json}")
        except Exception as e:
            print(f"Erro ao publicar: {e}")

# Função para buscar os registros de uma semana, e se não houver, buscar da semana anterior
def buscar_registros(semanas, semana_atual):
    semana_index = semanas.index(semana_atual)

    while semana_index >= 0:
        semana = semanas[semana_index]
        print(f"Buscando registros para a semana {semana['semana']}: de {semana['inicio']} a {semana['fim']}")

        total_records = fetch_all_results(start=semana['inicio'], end=semana['fim'])

        # Se encontrou registros, parar a busca
        if total_records > 0:
            print(f"Registros encontrados na semana {semana['semana']}")
            break
        else:
            print(f"Nenhum registro encontrado na semana {semana['semana']}, buscando semana anterior.")

        # Ir para a semana anterior
        semana_index -= 1

# Executar a função para buscar registros a partir da semana atual
if semana_atual:
    print(f"Semana epidemiológica atual: {semana_atual['semana']}, de {semana_atual['inicio']} a {semana_atual['fim']}")
    buscar_registros(semanas_epidemiologicas_2024, semana_atual)

# Aguardar antes de finalizar
time.sleep(5)
client.loop_stop()
client.disconnect()
```

- A API devolve vários campos. Dentre os selecionados para esse trabalho estão: 
  - nome do município 
  - semana epidemiológica 
  - umidade média
  - temperatura média
  - incidência 
  - nível. 
  
- A incidência informa a quantidade de casos de dengue e o nível a classificação. Esta é em uma escala de 1 a 4. Quando está em nível 4 a situação é de epidemia.

- Os dados são publicados via MQTT no tópico arbovirus/alertas. O comando utilizado para publicar foi python iotDeviceSimulator.py conforme figura abaixo:

![publish](https://github.com/user-attachments/assets/73e50412-877f-4aaa-8fb4-8f44ba8a38dc)


- Uma função lambda foi criada e é acionada por uma trigger quando os dados são publicados. Esses dados são armazenados no dynamoDB

- Uma outra função lambda foi criada e uma trigger é acionada quando um comando de voz é enviado e capturado pela alexa

- O comando de voz foi criado seguindo o modelo de interação abaixo:

```JSON
{
    "interactionModel": {
        "languageModel": {
            "invocationName": "relatório aedes",
            "intents": [
                {
                    "name": "EpidemiaIntent",
                    "slots": [
                        {
                            "name": "Cidade",
                            "type": "AMAZON.City"
                        }
                    ],
                    "samples": [
                        "qual é o nível de epidemia da dengue em {Cidade}",
                        "Existe epidemia de dengue em {Cidade}"
                    ]
                },
                {
                    "name": "AlertaIntent",
                    "slots": [
                        {
                            "name": "Cidade",
                            "type": "AMAZON.City"
                        }
                    ],
                    "samples": [
                        "qual é o nível de alerta de dengue em {Cidade}",
                        "Existe alerta de dengue em {Cidade}"
                    ]
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": [
                        "parar"
                    ]
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                }
            ],
            "types": [
                {
                    "name": "Cidade",
                    "values": [
                        {
                            "name": {
                                "value": "Osasco"
                            }
                        },
                        {
                            "name": {
                                "value": "Santo André"
                            }
                        },
                        {
                            "name": {
                                "value": "São Bernardo do Campo"
                            }
                        },
                        {
                            "name": {
                                "value": "Diadema"
                            }
                        },
                        {
                            "name": {
                                "value": "Santos"
                            }
                        },
                        {
                            "name": {
                                "value": "Envira"
                            }
                        },
                        {
                            "name": {
                                "value": "Maragogi"
                            }
                        },
                        {
                            "name": {
                                "value": "Campinas"
                            }
                        },
                        {
                            "name": {
                                "value": "São Paulo"
                            }
                        }
                    ]
                }
            ]
        },
        "dialog": {
            "intents": [
                {
                    "name": "AlertaIntent",
                    "confirmationRequired": false,
                    "prompts": {},
                    "slots": [
                        {
                            "name": "Cidade",
                            "type": "AMAZON.City",
                            "confirmationRequired": true,
                            "elicitationRequired": true,
                            "prompts": {
                                "confirmation": "Confirm.Slot.124945426741.1240169787177",
                                "elicitation": "Elicit.Slot.124945426741.1240169787177"
                            }
                        }
                    ]
                }
            ],
            "delegationStrategy": "ALWAYS"
        },
        "prompts": [
            {
                "id": "Confirm.Slot.124945426741.1240169787177",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Por favor, me informe o nome da cidade "
                    }
                ]
            },
            {
                "id": "Confirm.Intent.124945426741",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Por favor, me informe o nome da cidade"
                    }
                ]
            },
            {
                "id": "Elicit.Slot.124945426741.1240169787177",
                "variations": [
                    {
                        "type": "PlainText",
                        "value": "Por favor, me informe o nome da cidade"
                    }
                ]
            }
        ]
    }
}
```

O código lambda em javascript foi desenvolvido para capturar as intents invocadas pelos comandos de voz. Por exemplo, existe epidemia de dengue em São Paulo? Qual o nível de alerta de dengue em São Paulo?

![InteracaoAlexa](https://github.com/user-attachments/assets/73b3dbfb-12b7-4b2a-a801-884e3aaec9b6)


```Javascript
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
```
Código da trigger AWS IoT da função lambda Arboviroses

```Javascript
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const params = {
        TableName: "arboviroses",
        Item: {
           
            "municipio": event.municipio,
             "se":event.se,
            "umidade_media": event.umidade_media,
            "temperatura_media": event.temperatura_media,
            "incidencia": event.incidencia,
            "nivel": event.nivel
        }
    };

    try {
        const data = await dynamo.put(params);
        console.log("Data saved:", JSON.stringify(params, null, 2));
        return { "message": "Item created in DB" };
    } catch (err) {
        console.error("Unable to save data:", JSON.stringify(err, null, 2));
        throw new Error("Failed to save data");
    }
}
```

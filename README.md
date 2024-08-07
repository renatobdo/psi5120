# psi5120
Tópicos em computação em nuvem - PSI5120

### Trabalho ENUNCIADO
Implante um servidor web em um cluster KUBERNETES com auto-
escalamento horizontal automático.
Pede- se duas implantações:
a. Cluster Kubernetes usando minikube (REFERÊNCIA 1)
b. Cluster AWS EKS (REFERÊNCIA 2)

### REFERÊNCIAS
1) Horizontal Pod Autoscaler Walkthrough.
https://kubernetes.io/docs/tasks/run-application/horizontal-
pod-autoscale-walkthrough/
2) Scale pod deployments with Horizontal Pod Autoscaler.
https://docs.aws.amazon.com/eks/latest/userguide/horizontal-
pod-autoscaler.html

### a. Cluster Kubernetes usando minikube (REFERÊNCIA 1)
Seguindo a referência 1a Cluster Kubernetes usando minikube (REFERÊNCIA 1) é necessário instalar o minikube antes

- https://minikube.sigs.k8s.io/docs/tutorials/multi_node/#hello-svc.yaml 

- https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/ 

### 1 - Habilitando as métricas
minikube addons enable metrics-server

![1](https://github.com/user-attachments/assets/29eccb14-f0cc-4347-b3de-f747e5d1b0c8)


### 2 - criação do arquivo com o php-apache
nano php-apache.yaml

# php-apache Deployment and Service Configuration

Este repositório contém a configuração do Deployment e Service para o `php-apache`.

## Arquivo php-apache.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  selector:
    matchLabels:
      run: php-apache
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: registry.k8s.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m

---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
  labels:
    run: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
```

### 3 - Demonstração do Horizontal Pod Autoscaler com a implementação de um exemplo de imagem:
kubectl apply -f https://k8s.io/examples/application/php-apache.yaml

![3](https://github.com/user-attachments/assets/576d6556-b302-4d9a-a7c6-65f0867feabe)


### 4 - criação do Horizontal Pod Autoscaler o controlador HPA aumentará e diminuirá o número de réplicas para manter uma utilização média da CPU em todos os pods de 50%

kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10

![4](https://github.com/user-attachments/assets/7a5ddf07-cecd-41d0-ac56-b9d016966214)


### 5 - verificação do status do Horizontal Pod Autoscaler
kubectl get hpa

![5](https://github.com/user-attachments/assets/bc3c2eee-01db-4c0f-9070-93784e48f9f1)


### 6 - Aumentando a carga de trabalho

![6](https://github.com/user-attachments/assets/f5989289-0383-4398-aa80-ded323f52623)


### 7 - Monitoramento

![7](https://github.com/user-attachments/assets/060c646e-cac4-4acf-ab9a-e4ad3e7aa3f4)


### 8 - Finalização das requisições e o número de réplicas volta ao normal que é 1 e baixa utilização da cpu

![8](https://github.com/user-attachments/assets/72edfd9b-6d72-48be-89c4-51101c1541e1)


=====
### b. Cluster AWS EKS (REFERÊNCIA 2)


Seguindo a referência 1b Cluster AWS EKS (REFERÊNCIA 2).
https://docs.aws.amazon.com/eks/latest/userguide/horizontal-pod-autoscaler.html 

https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html
https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html 

Os requisitos para iniciar o cluster AWS EKS são:

AWS CLI;
kubectl
Required IAM permissions

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html 


### 1 - Para instalar o AWS CLI os seguintes comandos foram executados:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip sudo ./aws/install

![1b](https://github.com/user-attachments/assets/2b5a9b67-2738-4572-89f1-2a8b242765fc)



### 2 Para atualizar a instalação
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update

![2b](https://github.com/user-attachments/assets/8614fd62-8cc4-4bad-be92-d74706c38f4d)


### 3 As opções do comando de exemplo a seguir gravam o arquivo baixado no diretório atual com o nome local awscliv2.zip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

![3b](https://github.com/user-attachments/assets/688a1c7f-c610-486c-b0fc-3679195b24c0)


### 4 Para a última versão do AWS CLI
curl -o awscliv2.sig https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip.sig

![4b](https://github.com/user-attachments/assets/02144c58-abca-4b1e-b09c-6ff1c17b1424)


### 5 Para criar o arquivo de chave pública utilizei o comando nano awscliv2.pub e colei o conteúdo da chave:
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBF2Cr7UBEADJZHcgusOJl7ENSyumXh85z0TRV0xJorM2B/JL0kHOyigQluUG
ZMLhENaG0bYatdrKP+3H91lvK050pXwnO/R7fB/FSTouki4ciIx5OuLlnJZIxSzx
PqGl0mkxImLNbGWoi6Lto0LYxqHN2iQtzlwTVmq9733zd3XfcXrZ3+LblHAgEt5G
TfNxEKJ8soPLyWmwDH6HWCnjZ/aIQRBTIQ05uVeEoYxSh6wOai7ss/KveoSNBbYz
gbdzoqI2Y8cgH2nbfgp3DSasaLZEdCSsIsK1u05CinE7k2qZ7KgKAUIcT/cR/grk
C6VwsnDU0OUCideXcQ8WeHutqvgZH1JgKDbznoIzeQHJD238GEu+eKhRHcz8/jeG
94zkcgJOz3KbZGYMiTh277Fvj9zzvZsbMBCedV1BTg3TqgvdX4bdkhf5cH+7NtWO
lrFj6UwAsGukBTAOxC0l/dnSmZhJ7Z1KmEWilro/gOrjtOxqRQutlIqG22TaqoPG
fYVN+en3Zwbt97kcgZDwqbuykNt64oZWc4XKCa3mprEGC3IbJTBFqglXmZ7l9ywG
EEUJYOlb2XrSuPWml39beWdKM8kzr1OjnlOm6+lpTRCBfo0wa9F8YZRhHPAkwKkX
XDeOGpWRj4ohOx0d2GWkyV5xyN14p2tQOCdOODmz80yUTgRpPVQUtOEhXQARAQAB
tCFBV1MgQ0xJIFRlYW0gPGF3cy1jbGlAYW1hem9uLmNvbT6JAlQEEwEIAD4CGwMF
CwkIBwIGFQoJCAsCBBYCAwECHgECF4AWIQT7Xbd/1cEYuAURraimMQrMRnJHXAUC
ZqFYbwUJCv/cOgAKCRCmMQrMRnJHXKYuEAC+wtZ611qQtOl0t5spM9SWZuszbcyA
0xBAJq2pncnp6wdCOkuAPu4/R3UCIoD2C49MkLj9Y0Yvue8CCF6OIJ8L+fKBv2DI
yWZGmHL0p9wa/X8NCKQrKxK1gq5PuCzi3f3SqwfbZuZGeK/ubnmtttWXpUtuU/Iz
VR0u/0sAy3j4uTGKh2cX7XnZbSqgJhUk9H324mIJiSwzvw1Ker6xtH/LwdBeJCck
bVBdh3LZis4zuD4IZeBO1vRvjot3Oq4xadUv5RSPATg7T1kivrtLCnwvqc6L4LnF
0OkNysk94L3LQSHyQW2kQS1cVwr+yGUSiSp+VvMbAobAapmMJWP6e/dKyAUGIX6+
2waLdbBs2U7MXznx/2ayCLPH7qCY9cenbdj5JhG9ibVvFWqqhSo22B/URQE/CMrG
+3xXwtHEBoMyWEATr1tWwn2yyQGbkUGANneSDFiTFeoQvKNyyCFTFO1F2XKCcuDs
19nj34PE2TJilTG2QRlMr4D0NgwLLAMg2Los1CK6nXWnImYHKuaKS9LVaCoC8vu7
IRBik1NX6SjrQnftk0M9dY+s0ZbAN1gbdjZ8H3qlbl/4TxMdr87m8LP4FZIIo261
Eycv34pVkCePZiP+dgamEiQJ7IL4ZArio9mv6HbDGV6mLY45+l6/0EzCwkI5IyIf
BfWC9s/USgxchg==
=ptgS
-----END PGP PUBLIC KEY BLOCK-----

Import the AWS CLI public key com o comando gpg --import awscliv2.pub

![5b](https://github.com/user-attachments/assets/7d7adabf-a920-4a78-85d0-c5f09d93ad35)




### 6 Verificando a assinatura
gpg --verify awscliv2.sig awscliv2.zip

![6b](https://github.com/user-attachments/assets/c0bb3780-ea1d-41d5-a85f-81be0f58b4b0)


### 7 Descompactar o instalador
unzip awscliv2.zip

![7b](https://github.com/user-attachments/assets/179ec3b4-e5e2-41b9-85f7-c82d1e97165a)


### 8 Executando o programa de instalação
sudo ./aws/install

Para atualizar a instalação atual da AWS CLI
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update

![8b](https://github.com/user-attachments/assets/3f4ecc66-24df-41b9-b223-30c164a6a998)



### 9 - Confirmando a instalação
aws --version

![9b](https://github.com/user-attachments/assets/800e10c7-c06c-4932-be3f-fca0ba718402)



https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html
### 10 - Verificando a versão do kubectl

![10b](https://github.com/user-attachments/assets/80b2e707-161f-4e04-a7ee-453183fd7a0c)


### 11 - Instância criada de acordo com aula 6 do professor Sérgio:

![11b](https://github.com/user-attachments/assets/a5ba2d93-f9a5-49ef-ab35-3b8b35c5f6f9)


### 12 - Mudando a permissão do arquivo:


![12b](https://github.com/user-attachments/assets/bd7aecf5-622e-4fa5-bab3-0fa6aba18a6f)

![12b2](https://github.com/user-attachments/assets/176e5a9a-ac8d-4920-a80b-a9ebba95c4e5)


### 13 - Logar na instância via ssh:

![13b](https://github.com/user-attachments/assets/dc6a4d16-2e91-4af7-911a-b639d9f64cef)


### 14 - Criação do perfil (role):

![14b](https://github.com/user-attachments/assets/2e8bd98a-a1a4-4367-87ae-e759209d9853)

![14b2](https://github.com/user-attachments/assets/7b8daca9-5e3f-4685-bbc7-d7cd00516683)




### 15 - Criação do cluster eks
https://docs.aws.amazon.com/eks/latest/userguide/horizontal-pod-autoscaler.html

![15b2](https://github.com/user-attachments/assets/90243d03-1a09-4eec-80a5-5b42b2386924)


### 16 - Adicionar grupos de nós (Workers):

![16b](https://github.com/user-attachments/assets/17bcddd5-ab5e-4ff5-89cb-ea8710c20a6a)

![16b2](https://github.com/user-attachments/assets/195c4e53-d51c-489a-b6e0-50b55914b8e1)

![16b3](https://github.com/user-attachments/assets/4acbcfad-bded-4001-81b2-31d2e34d0854)


### 17 - Geração de chave de acesso. Fiz o download da chave de acesso rootkey.csv:

![17](https://github.com/user-attachments/assets/2a2df7e7-8e40-47b1-b7fc-59a2b226c838)


### 18 - Instalação do AWS CLI no linux (ver atividade 6-2.pdf):

![18](https://github.com/user-attachments/assets/774b4e4c-dc78-4d2c-b21f-ed7442da227d)


### 19 - Configuração

![19b](https://github.com/user-attachments/assets/f04356ec-c7cd-47ff-93ca-15c5978d0ebc)


### 20 - Instalação do kubectl

![20b](https://github.com/user-attachments/assets/b0bbc043-7291-484e-b58e-e96d7bb88fc5)


### 21 - Instalação do eksctl

![21b](https://github.com/user-attachments/assets/bf406b10-a687-4436-b101-2bc306e3db01)


### 22 - Verificação da conta (ver atividade 6.1.pdf)

![22b](https://github.com/user-attachments/assets/916494e6-82af-42b2-9ae8-f4c1f9cf47fb)


### 23 - Atualização do cluster que criei na AWS 

![23](https://github.com/user-attachments/assets/8ec82cbe-8f1a-4a68-a4cd-4461073367da)


### 24 - aquivo nginx-deployment.yaml

Arquivo com a formatação correta:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
	app: nginx
spec:
  replicas: 1
  selector:
	matchLabels:
  	app: nginx
  template:
	metadata:
  	labels:
    	app: nginx
	spec:
  	containers:
  	- name: nginx
    	image: public.ecr.aws/t1f2w6h8/ekswelcome:v1
    	ports:
    	- containerPort: 80


![24b](https://github.com/user-attachments/assets/5b206a88-a35a-4be8-8cee-f615b1196248)


### 25 - Executando o comando abaixo para expor a implantação do Nginx como um serviço LoadBalancer
kubectl expose deployment nginx-deployment --name=nginx-service --port=80 --target-port=80 --type=LoadBalance

![25b](https://github.com/user-attachments/assets/f6fe4588-0bc8-4a30-8442-9da58de36f98)


### 26 - Executando o comando abaixo para recuperar informações sobre o serviço Nginx com LoadBalance
kubectl get service nginx-service

![26b](https://github.com/user-attachments/assets/6e72fe0f-daea-458e-a346-6325d509e286)


### 27 - Informações do cluster
eksctl get nodegroup --cluster eks_cluster_nusp12219799

![27b](https://github.com/user-attachments/assets/b32955fe-3859-44fd-b58e-ff3136048035)


### 28 - Remoção do cluster:

![28b](https://github.com/user-attachments/assets/3586549e-985c-49c0-9c00-723e1dc5dec3)

![28b2](https://github.com/user-attachments/assets/3843d7a6-b234-4b13-b211-fdbefdfdd363)





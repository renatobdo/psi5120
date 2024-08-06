# psi5120
Tópicos em computação em nuvem - PSI5120

# Trabalho ENUNCIADO
Implante um servidor web em um cluster KUBERNETES com auto-
escalamento horizontal automático.
Pede- se duas implantações:
a. Cluster Kubernetes usando minikube (REFERÊNCIA 1)
b. Cluster AWS EKS (REFERÊNCIA 2)

# REFERÊNCIAS
1) Horizontal Pod Autoscaler Walkthrough.
https://kubernetes.io/docs/tasks/run-application/horizontal-
pod-autoscale-walkthrough/
2) Scale pod deployments with Horizontal Pod Autoscaler.
https://docs.aws.amazon.com/eks/latest/userguide/horizontal-
pod-autoscaler.html

# a. Cluster Kubernetes usando minikube (REFERÊNCIA 1)
Seguindo a referência 1a Cluster Kubernetes usando minikube (REFERÊNCIA 1) é necessário instalar o minikube antes
https://minikube.sigs.k8s.io/docs/tutorials/multi_node/#hello-svc.yaml 
https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/ 

# 1 - Habilitando as métricas
minikube addons enable metrics-server

# 2 - criação do arquivo com o php-apache
nano php-apache.yaml

o arquivo php-apache.yaml tem o seguinte conteúdo:
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

# 3 - Demonstração do Horizontal Pod Autoscaler com a implementação de um exemplo de imagem:
kubectl apply -f https://k8s.io/examples/application/php-apache.yaml

# 4 - criação do Horizontal Pod Autoscaler o controlador HPA aumentará e diminuirá o número de réplicas para manter uma utilização média da CPU em todos os pods de 50%

kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10

# 5 - verificação do status do Horizontal Pod Autoscaler
kubectl get hpa


# 6 - Aumentando a carga de trabalho

# 7 - Monitoramento

# 8 - Finalização das requisições e o número de réplicas volta ao normal que é 1 e baixa utilização da cpu




# b. Cluster AWS EKS (REFERÊNCIA 2)


Seguindo a referência 1b Cluster AWS EKS (REFERÊNCIA 2).
https://docs.aws.amazon.com/eks/latest/userguide/horizontal-pod-autoscaler.html 

https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html
https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html 

Os requisitos para iniciar o cluster AWS EKS são:

AWS CLI;
kubectl
Required IAM permissions

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html 


# 1 - Para instalar o AWS CLI os seguintes comandos foram executados:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip sudo ./aws/install




# 2 Para atualizar a instalação
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update



# 3 As opções do comando de exemplo a seguir gravam o arquivo baixado no diretório atual com o nome local awscliv2.zip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"



# 4 Para a última versão do AWS CLI
curl -o awscliv2.sig https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip.sig



# 5 Para criar o arquivo de chave pública utilizei o comando nano awscliv2.pub e colei o conteúdo da chave:
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





# 6 Verificando a assinatura
gpg --verify awscliv2.sig awscliv2.zip



# 7 Descompactar o instalador
unzip awscliv2.zip



# 8 Executando o programa de instalação
sudo ./aws/install

Para atualizar a instalação atual da AWS CLI
sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update




# 9 - Confirmando a instalação
aws --version




https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html
# 10 - Verificando a versão do kubectl



# 11 - Instância criada de acordo com aula 6 do professor Sérgio:



# 12 - Mudando a permissão do arquivo:





# 13 - Logar na instância via ssh:



# 14 - Criação do perfil (role):





# 15 - Criação do cluster eks
https://docs.aws.amazon.com/eks/latest/userguide/horizontal-pod-autoscaler.html



# 16 - Adicionar grupos de nós (Workers):







# 17 - Geração de chave de acesso. Fiz o download da chave de acesso rootkey.csv:



# 18 - Instalação do AWS CLI no linux (ver atividade 6-2.pdf):




# 19 - Configuração



# 20 - Instalação do kubectl





# 21 - Instalação do eksctl



# 22 - Verificação da conta (ver atividade 6.1.pdf)



# 23 - Atualização do cluster que criei na AWS 


# 24 - aquivo nginx-deployment.yaml

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




# 25 - Executando o comando abaixo para expor a implantação do Nginx como um serviço LoadBalancer
kubectl expose deployment nginx-deployment --name=nginx-service --port=80 --target-port=80 --type=LoadBalance



# 26 - Executando o comando abaixo para recuperar informações sobre o serviço Nginx com LoadBalance
kubectl get service nginx-service







# 27 - Informações do cluster
eksctl get nodegroup --cluster eks_cluster_nusp12219799



# 28 - Remoção do cluster:





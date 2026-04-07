# Étape 1 : choisir l'image officielle Node.js
FROM node:24

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

# Exposer le port que Node utilisera
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "app.js"]
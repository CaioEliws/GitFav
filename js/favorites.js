import { GithubUser } from "./GithubUser.js"


export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase());

            if(userExists) {
                throw new Error ('Usuário já cadastrado')
            }


            const user = await GithubUser.search(username)
    
            if(user.login === undefined) {
            throw new Error('Usuário não encontrado!')
            }
    
            this.entries = [user, ...this.entries]
            this.update()
            this.save()
    
        } catch(error) {
            alert(error.message)
            }
    }

    delete(user) {
    const filteredEntries = this.entries
        .filter(entry => entry.login !== user.login)
    
    this.entries = filteredEntries
    this.update()
    this.save()
    }
}


export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);
    
        this.tbody = this.root.querySelector('table tbody');
    
        this.update();
        this.onadd();
    }

    onadd() {
        const addButton = this.root.querySelector('.search button');
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input');

            this.add(value);
        };

        const inputField = this.root.querySelector('.search input');
        inputField.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.add(inputField.value);
                inputField.value = '';
            }
        });
    }

    update() {
        this.removeAllTr();

        this.entries.forEach(user => {
            const row = this.createRow();
            
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
            row.querySelector('.user img').alt = `Imagem de ${user.name}`;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;

            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user span').textContent = user.login;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?');
                if (isOk) {
                    this.delete(user);
                }
            };

            this.tbody.append(row);
        });

        this.toggleNothingMessage();
    }

    toggleNothingMessage() {
        const nothingContainer = this.root.querySelector('#nothingContainer');
        const table = this.root.querySelector('table');
    
        if (this.entries.length === 0) {
            nothingContainer.style.display = 'flex';
            table.style.borderRadius = '0'; // Remover o border-radius
        } else {
            nothingContainer.style.display = 'none';
            table.style.borderRadius = '1.5rem'; // Reaplicar o border-radius
        }
    }

    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/caioeliws.png" alt="Imagem de caioeliws">
                <a href="https://github.com/caioeliws" target="_blank">
                    <p>Caio Elias</p>
                    <span>caioeliws</span>
                </a>
            </td>
            <td class="repositories">
                90
            </td>
            <td class="followers">
                289472
            </td>
            <td>
                <button class="remove">Remover</button>
            </td>
        `;

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove();
        });
    }
}
# 🛡️ LS Check — Verificação Técnica Veicular
![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Frontend](https://img.shields.io/badge/100%25%20Frontend-informational)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Sistema web completo para consulta de histórico veicular, com landing page pública, painel administrativo e tela de autenticação.

---

## 📸 Preview

| Landing Page | Painel Admin | Login |
|---|---|---|
| Página pública com consulta por placa | Dashboard com 5 abas de gestão | Tela de login e cadastro |

---

## 📁 Estrutura do Projeto

```
cd consulta-veicular/
├── index.html       # Landing page pública
├── style.css        # Estilos da landing page
├── script.js        # Interações da landing page
├── login.html       # Tela de login e cadastro
└── admin.html       # Painel administrativo
```

---

## ✨ Funcionalidades

### 🌐 Landing Page (`index.html`)
- Navbar responsiva com menu hambúrguer no mobile
- Seção hero com input de placa e botão de consulta via WhatsApp
- Seções: Serviços, Como Funciona e FAQ
- Animações de entrada com `IntersectionObserver`
- Botão flutuante do WhatsApp
- Scroll suave entre seções
- Link ativo na navbar conforme scroll

### 🔐 Login (`login.html`)
- Tela de **Entrar** com e-mail e senha
- Tela de **Criar Conta** com nome/empresa, CNPJ/CPF, telefone, e-mail e senha
- Toggle para mostrar/ocultar senha
- Alternância suave entre os dois painéis
- Redirecionamento para o painel admin após login

### 🖥️ Painel Admin (`admin.html`)
- **Cards de métricas** atualizados dinamicamente (Total, Pendentes, Enviados, Admins)
- **5 abas funcionais:**
  - **Pedidos** — busca em tempo real, filtro por status e data, deletar com confirmação
  - **Usuários** — gestão de administradores e usuários comuns
  - **Faturamento** — lista de clientes com preço por consulta e visualização de fatura
  - **Pagamentos** — resumo por status e alteração de pagamento direto na lista
  - **Relatórios** — tabela de custos por tipo de consulta com total automático

---

## 🎨 Identidade Visual

| Elemento | Valor |
|---|---|
| Fonte | DM Sans (Google Fonts) |
| Azul escuro | `#052288` |
| Azul ação | `#0453cc` |
| Fundo | `#f6f6f6` |
| Cards | `#ffffff` com `border-radius: 12px` |
| Verde (Pago/Enviado) | `#16a34a` |
| Amarelo (Pendente) | `#d97706` |
| Vermelho (Não Pago) | `#dc2626` |

---

## 🛠️ Tecnologias

- **HTML5** — estrutura semântica
- **CSS3** — variáveis CSS, flexbox, grid, responsividade
- **JavaScript** — vanilla JS, sem frameworks
- **[Lucide Icons](https://lucide.dev/)** — ícones via CDN
- **[DM Sans](https://fonts.google.com/specimen/DM+Sans)** — tipografia via Google Fonts

> Projeto 100% front-end, sem dependências de build ou instalação.

---

## 🚀 Como usar

1. Clone o repositório:
```bash
git clone victorylesson/consulta-veicular.git
```

2. Abra a pasta:
```bash
cd ls-check
```

3. Abra o `index.html` no navegador — ou use o Live Server do VS Code para melhor experiência.

> **Atenção:** todos os arquivos devem estar na mesma pasta para o redirecionamento entre páginas funcionar corretamente.

---

## 📱 Responsividade

O projeto é responsivo para mobile, tablet e desktop. Testado nos breakpoints:
- `< 480px` — mobile
- `480px – 900px` — tablet
- `> 900px` — desktop

---

## 🔗 Próximos passos

- [ ] Integrar autenticação real (Firebase Auth ou similar)
- [ ] Conectar painel admin a uma API/banco de dados
- [ ] Adicionar validação de formulários com feedback visual
- [ ] Implementar exportação de relatórios em PDF
- [ ] Adicionar skeleton screens nos estados de carregamento

---

## 👨‍💻 Autor

**Victory Lesson Mendes Pinto de Oliveira**  
Estudante de Tecnologia · Desenvolvedor Freelancer  
Especialista em criação de sites, UX/UI e automação com IA

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=flat&logo=Instagram&logoColor=white)](https://www.instagram.com/victory__dev/)
[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/victorylesson)

---

## 📄 Licença

Este projeto foi desenvolvido para uso comercial do cliente **LS Check — Lincoln Santos Engenharia Mecânica**.  
Todos os direitos reservados.

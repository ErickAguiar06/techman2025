const express = require('express');
const router = express.Router();
const auth = require('./controllers/auth');
const equipamento = require('./controllers/equipamentos');
const comentario = require('./controllers/comentario');

router.post('/login', auth.login);
router.get('/perfil', auth.autenticar, auth.getPerfil);
router.post('/logout', auth.logout);

router.get('/equipamentos', auth.autenticar, equipamento.listar);
router.post('/equipamentos', auth.autenticar, equipamento.criar);
router.delete('/equipamentos/:id', auth.autenticar, equipamento.excluir);

router.get('/equipamentos/:equipamentoId/comentarios', auth.autenticar, comentario.listarPorEquipamento);
router.post('/comentarios', auth.autenticar, comentario.criar);

module.exports = router;
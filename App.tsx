import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Alert } from "react-native";

export default function EstoqueApp() {
  const [produto, setProduto] = useState("");
  const [estoqueInicial, setEstoqueInicial] = useState(0);
  const [saidaDiaria, setSaidaDiaria] = useState(0);
  const [estoqueAtual, setEstoqueAtual] = useState<number>(0);
  const [historico, setHistorico] = useState<
  { id: number; produto: string; saida: number; restante: number; horario: string; estoqueInicial: number }[]
>([]);
  const [inicioEstoque, setInicioEstoque] = useState<string | null>(null);
  const [fimEstoque, setFimEstoque] = useState<{ data: string; quantidadeRestante: number } | null>(null);
  const [editarItem, setEditarItem] = useState(null);

  const registrarSaida = () => {
    if (saidaDiaria > estoqueAtual) {
      Alert.alert("Erro", "Saída maior que o estoque disponível!");
      return;
    }
    const novoEstoque = (estoqueAtual ?? 0) - saidaDiaria;
    setEstoqueAtual(novoEstoque);
    setHistorico(function (prevHistorico) {
      return [
        ...prevHistorico,
        {
          id: prevHistorico.length + 1,
          produto,
          saida: saidaDiaria,
          restante: novoEstoque,
          estoqueInicial,
          horario: formatarData(new Date()), // Armazenar a data e hora da saída
        },
      ];
    });
    setSaidaDiaria(0);
    setFimEstoque({
      data: formatarData(new Date()),
      quantidadeRestante: novoEstoque,
    });
  };

  function definirEstoqueInicial() {
    setEstoqueAtual(Number(estoqueInicial));
    setInicioEstoque(formatarData(new Date()));
  }

  // Função para formatar data no formato 'dd/mm/yyyy hh:mm'
  function formatarData(data: Date) {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");
  
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }
  

  // Função para editar um item do histórico
  const editarHistorico = (item: { id: number; produto: string; saida: number }) => {
    setProduto(item.produto);
    setSaidaDiaria(item.saida);
    setEditarItem(item.id);
  };

  // Função para salvar as edições no histórico
  const salvarEdicao = () => {
    if (saidaDiaria > estoqueAtual) {
      Alert.alert("Erro: Saída maior que o estoque disponível!");
      return;
    }

    setHistorico((prevHistorico) => {
      return prevHistorico.map((item) =>
        item.id === editarItem
          ? {
              ...item,
              produto,
              saida: saidaDiaria,
              horario: formatarData(new Date()), // Atualizar a data e hora da edição
              restante: estoqueAtual - saidaDiaria,
            }
          : item
      );
    });
    setEditarItem(null);
    setProduto("");
    setSaidaDiaria(0);
  };

  // Função para excluir um item do histórico
  const excluirHistorico = (id: number) => {
    setHistorico((prevHistorico) => prevHistorico.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle de Estoque Diário</Text>
      
      <Text>Produto:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setProduto(text)}
        value={produto}
      />
      
      <Text>Estoque Inicial:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => setEstoqueInicial(Number(text) || 0)}
        value={String(estoqueInicial)}
      />
      
      <Button title="Definir Estoque Inicial" onPress={definirEstoqueInicial} />
      
      {inicioEstoque && <Text>Início do Estoque: {inicioEstoque}</Text>}
      
      <Text>Saída do Dia:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => setSaidaDiaria(Number(text) || 0)}
        value={String(saidaDiaria)}
        />

      <Button title="Registrar Saída" onPress={registrarSaida} />
      
      {fimEstoque && (
        <Text>
          Fim do Estoque: {fimEstoque.data} | Quantidade Restante para o Próximo Dia: {fimEstoque.quantidadeRestante}
        </Text>
      )}
      
      <Text>Estoque Atual: {estoqueAtual}</Text>
      <Text style={styles.title}>Histórico de Saídas Diário</Text>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>
              Produto: {item.produto} | Saída: {item.saida} | Restante: {item.restante} | Estoque Inicial: {item.estoqueInicial} | Horário: {item.horario}
            </Text>
            <TouchableOpacity onPress={() => editarHistorico(item)}>
              <Text style={styles.button}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => excluirHistorico(item.id)}>
              <Text style={styles.button}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      {editarItem !== null && (
        <View>
          <Button title="Salvar Edição" onPress={salvarEdicao} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    padding: 5,
    marginBottom: 10,
    width: "100%",
  },
  itemContainer: {
    marginVertical: 10,
  },
  button: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
import { Component } from "@angular/core";
import { interval } from "rxjs";
import { takeUntil, map, filter } from "rxjs/operators";

/**
 * Classe que calcula dados de salários
 */
import { Salario } from "./Salario";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  salario = new Salario(0);
  salarioBruto = "R$ 0,00";
  salarioLiquidoDesejado = this.salarioBruto;

  _internalUpdateSalario(newSalario) {
    this.salario = new Salario(+newSalario);
  }

  updateSalario(valor) {
    this._internalUpdateSalario(+valor);
  }

  updateSalarioLiquidoDesejado(valor) {
    this.salarioBruto = valor;
    this._internalUpdateSalario(this.salarioBruto);
  }

  /**
   * Método para encontrar um salário bruto necessário
   * para o salário líquido desejado
   */
  findSalarioBrutoFromLiquido() {
    /**
     * Obtendo o input que define o salário bruto
     * e atualizando-o com o salário líquido desejado,
     * evitando iterações desnecessárias.
     *
     * $el é uma variável especial do Vue que aponta
     * para o elemento monitorado pelo Vue. Na maioria
     * dos casos, é uma div com id #app (verifique index.html).
     * Com $el, conseguimos "navegar" dentro dos filhos do
     * elemento (children), obtendo referências com querySelector,
     * por exemplo.
     */
    // const inputSalarioBruto = this.$el.querySelector("#inputSalarioBruto");
    //inputSalarioBruto.value = this.salarioLiquidoDesejado;

    this._internalUpdateSalario(this.salarioBruto);

    /**
     * Criando observable que, a cada 1 milisegundo, incrementa
     * o salário bruto e o recalcula no estado da aplicação. Por
     * fim, retorna o salarioLiquido obtido após o cálculo.
     *
     */
    const obs$ = interval(1).pipe(
      /**
       * Transformação de dados (map)
       */
      map(() => {
        /**
         * Obtendo o salário líquido do momento
         */
        const currentValue = +this.salario.salarioLiquido;

        /**
         * Calculando a diferença entre o salário líquido do momento
         * e o salário líquido desejado
         */
        const difference = Math.abs(
          currentValue - +this.salarioLiquidoDesejado
        );

        /**
         * Quando a diferença for menor que 5 reais, o
         * incremento passa a ser de 1 centavo (0.01)
         * para uma melhor precisão no cálculo sem que
         * o mesmo se torne lento, ou seja, enquanto a
         * diferença for maior que 5 reais o incremento
         * é de "1 em 1 real"
         */
        const increment = difference >= 5 ? 1 : 0.01;

        /**
         * Incrementando o valor no salário bruto
         * e formatando para 2 casas decimais
         */
        this.salarioBruto = this.salarioBruto + increment;

        /**
         * Atualizando o salário bruto. Quando atualizamos o valor
         * "na mão", o Vue não consegue monitorar as
         * mudanças
         */
        this._internalUpdateSalario(this.salarioBruto);

        /**
         * Por fim, retornamos o salário líquido atual
         */
        return this.salario.salarioLiquido;
      })
    );

    /**
     * Observable para ser utilizado com takeUntil,
     * que será a condição de término da execução
     * (salarioLiquido do estado maior ou igual ao salarioLiquido desejado)
     */
    const match$ = obs$.pipe(
      filter(currentValue => +currentValue >= +this.salarioLiquidoDesejado)
    );

    /**
     * Acionamos, por fim, a execução do observable com
     * subscribe()
     */
    obs$.pipe(takeUntil(match$)).subscribe();
  }
}

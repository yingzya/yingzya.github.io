---
title: 复习——数学篇
description: 梳理了线性代数和概率论的核心概念与解题方法，涵盖行列式、矩阵、方程组、特征值及二次型等。概率论涉及分布、大数定理等。
date: 2025-08-20 21:45:38
updated: 2025-08-20 21:45:38
# image:
# type: story
categories: [复习]
tags: [线代, 概率论]
---

## 线性代数

### 行列式

**1、行列式性质及计算**

**①互换行（列），变号**：交换行列式的两行（列），行列式的值变号。比如$D=\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}$ ，交换两行得$\begin{vmatrix}a_{21}&a_{22}\\a_{11}&a_{12}\end{vmatrix}=-D$ 。

**②提公因子**：行列式某一行（列）的所有元素都有公因子$k$ ，可把$k$提到行列式外面。即若$D=\begin{vmatrix}ka_{11}&ka_{12}\\a_{21}&a_{22}\end{vmatrix}$ ，则$D = k\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}$ 。 

**③倍加**：把行列式某一行（列）的元素乘以数$k$后加到另一行（列）对应元素上，行列式的值不变。比如$D=\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}$ ，第一行乘$k$加到第二行，得$\begin{vmatrix}a_{11}&a_{12}\\a_{21}+ka_{11}&a_{22}+ka_{12}\end{vmatrix}=D$ 。

**④拆分**：若行列式某一行（列）的元素都是两数之和，可拆成两个行列式之和。如$D=\begin{vmatrix}a_{11}+b_{11}&a_{12}+b_{12}\\a_{21}&a_{22}\end{vmatrix}$ ，则$D=\begin{vmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{vmatrix}+\begin{vmatrix}b_{11}&b_{12}\\a_{21}&a_{22}\end{vmatrix}$ 。

**⑤对应成比例，值为零**：若行列式有两行（列）对应元素成比例，行列式的值为$0$ 。比如$D=\begin{vmatrix}a_{11}&a_{12}\\ka_{11}&ka_{12}\end{vmatrix}$ ，两行成比例，$D = 0$ 。 

**2、行列式展开、范德蒙行列式**

::pic
---
src: https://7.isyangs.cn/20250819/b6c57c07d949a20302aabcb5b4d60caa.png
caption: 
---
::

 定义   

- **余子式 $\boldsymbol{M_{ij}}$**：去掉行列式中元素 $\boldsymbol{a_{ij}}$ 所在的第 $\boldsymbol{i}$ 行和第 $\boldsymbol{j}$ 列，剩余元素构成的新行列式。  
-  **代数余子式 $\boldsymbol{A_{ij}}$**：$\boldsymbol{A_{ij}=(-1)^{i+j}M_{ij}}$ （符号由元素位置的行标 $\boldsymbol{i}$、列标 $\boldsymbol{j}$ 决定 ）。    

::pic
---
src: https://7.isyangs.cn/20250819/15f9526f0e403a8642098d91f0590367.png
caption: 
---
::

**按行展开**   
对 $n$ 阶行列式 $D$，取第 $\boldsymbol{i}$ 行（$i = 1,2,\dots,n$  ），有：   $$\boldsymbol{D = a_{i1}A_{i1} + a_{i2}A_{i2} + \cdots + a_{in}A_{in}}$$   其中，$\boldsymbol{a_{ij}}$ 是行列式第 $i$ 行第 $j$ 列的元素，$\boldsymbol{A_{ij}}$ 是 $\boldsymbol{a_{ij}}$ 的代数余子式（$A_{ij}=(-1)^{i+j}M_{ij}$ ，$M_{ij}$ 为余子式 ）。   

**按列展开**
 对 $n$ 阶行列式 $D$，取第 $\boldsymbol{j}$ 列（$j = 1,2,\dots,n$  ），有：   $$\boldsymbol{D = a_{1j}A_{1j} + a_{2j}A_{2j} + \cdots + a_{nj}A_{nj}}$$   同理，$\boldsymbol{a_{ij}}$ 是行列式第 $i$ 行第 $j$ 列的元素，$\boldsymbol{A_{ij}}$ 是对应代数余子式 。    

###  矩阵

**1、矩阵的三则运算**

行列式 $D=\begin{vmatrix}1&2&3\\1&3&4\\3&1&2\end{vmatrix}$ ，矩阵$A=\begin{pmatrix}1&2&3\\1&3&4\\3&1&2\end{pmatrix}$ ；

①行列式是一个数，矩阵是一个表

②行列式是 $n×n$ 阶，矩阵是 $n×m$ 阶（$n$ 和 $m$ 可以不相等也可以相等）

③ $\lambda\vert A\vert$ 是把行列式某行（列）乘以 $\lambda$ ；$\lambda A$ 是把矩阵里每个元素都乘以 $\lambda$

④行列式加减是数的运算；矩阵的加减只能是同型矩阵，对应元素的加减

⑤矩阵如果是方阵（$n = m$ ）的时，有行列式值

矩阵的乘法:$AB \neq BA$

**2、转置矩阵、伴随矩阵、单位矩阵、逆矩阵**

1）转置矩阵 \($ A^{\text{T}}$ \)  

就是**行变列**、**列变行** 

$\boldsymbol{
A=\begin{pmatrix}1&2&3\\1&3&4\\3&1&2\end{pmatrix},\quad
A^{\text{T}}=\begin{pmatrix}1&1&3\\2&3&1\\3&4&2\end{pmatrix}
}$


 2）伴随矩阵  $A^{*}=\begin{pmatrix}A_{11}&A_{21}&\cdots&A_{n1}\\A_{12}&A_{22}&\cdots&A_{n2}\\\vdots&\vdots&\ddots&\vdots\\A_{1n}&A_{2n}&\cdots&A_{nn}\end{pmatrix}$ 

3）单位矩阵 E： $E = \begin{pmatrix}1&0\\0&1\end{pmatrix}$      $E = \begin{pmatrix}1&0&0\\0&1&0\\0&0&1\end{pmatrix}$       $|E| = 1$      $EA = AE = A$ 

4）逆矩阵 $A^{-1}$

$AB = BA = E$则$B$为$A$得逆矩阵，记$B = A^{-1}$；即： $AA^{-1} = E$
公式： $A^{-1} = \frac{A^{*}}{\vert A \vert}$ 可逆得充要条件$\vert A \vert \neq 0$

**3、矩阵的行列式运算**

**一些重要的运算性质:**
$|kA| = k^n|A|$  、 $$|A^{-1}| = \frac{1}{|A|}$$、   $$(kA)^{-1} = \frac{1}{k}A^{-1}$$ 、  $$|A^{*}| = |A|^{n - 1}$$ 、  $$A^{*} = |A|A^{-1}$$、   $$|AB| = |BA| = |A||B|$$  

### 初等行变换

**1、初等行变换**

①换行 ②倍乘 ③倍加  三种运算

变换用箭头连接而非等号，**换行后**，矩阵前不会加**负号**。

**倍乘**时，也并不会在前面提出一个**系数**。

**阶梯形矩阵**的特征 1. 若有全零行，则全零行位于最下方  2. 每个阶梯首项为主元，主元依次往右  3. 阶梯形不唯一 

**最简形** ①主元为1 ②主元所在列的其他元素都为0 ③最简形是唯一

**2、求逆矩阵**

题1. 若  $A = \begin{pmatrix}1&1&-1\\2&1&0\\1&-1&0\end{pmatrix}$ ，求 $A^{-1}$ 。$(A\vdots E)\longrightarrow(E\vdots A^{-1})$
只需将A通过**初等行变换**，变为**单位矩阵**$E$，则右边的矩阵就是$A^{-1}$

题2. 若$A = \begin{pmatrix} 1 & 3 \\ 2 & 2 \end{pmatrix}$ 求$A^{-1}$ 

$A = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \quad$ $A^{-1}$ = $\frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$  **主对调，次反号，除以值**

题3. 设 $A = \begin{pmatrix} 4 & 2 & 3 \\ 1 & 1 & 0 \\ -1 & 2 & 3 \end{pmatrix}$，且 $AX = A + 2X$，求 $X$ 解：$AX = A + 2X \Rightarrow AX - 2X = A \Rightarrow (A - 2E)X = A$ 

通过像题1，将$(A - 2E)$化为单位矩阵，则右边的矩阵即为$X$ 

**3、矩阵的秩**

**矩阵的秩**即为**主元的个数**

秩的性质如下：

1. $A_{m \times n} \quad R(A) \leq \min\{m, n\}$ 
2. $A$ 为方阵 $R(A) = n \Leftrightarrow |A| \neq 0 \quad R(A) < n \Leftrightarrow |A| = 0$
3. $R(A^T) = R(A) = R(kA) \quad (k \neq 0)$
4. $R(AB) \leq R(A) \quad R(AB) \leq R(B)$

### 向量

**1、向量组**

  **向量组**：由若干个向量组成的集合，通常记为 ${v_1, v_2, \dots, v_n}$。

**2、线性相关**

① 存在一组不全为0的数 \( $k_1, k_2, \cdots k_m$ \)，使$k_1a_1 + k_2a_2 + \cdots + k_ma_m = 0$则称向量组$a_1, a_2, \cdots a_m$ 线性相关，否则线性无关。

② 若$R(a_1, a_2, \cdots a_m) < m$，则向量线性相关若$R(a_1, a_2, \cdots a_m) = m$，则向量线性无关。

③ 极大无关组

阶梯型矩阵**最简形**的**主元**所在列是**极大无关组**

### 解方程组

**1、齐次线性方程组**

方程右边全为0，称为齐次线性方程组。求解一般分为三步:**判断解的情况**、**求解向量**、**表示通解**

先写出**系数**矩阵，然后将其化简为**最简**形的**阶梯矩阵**。

判定：系数矩阵$A$

$R(A) = n$只有零解

$R(A) < n$有无穷多解且有 $n - R(A)$个解向量

**通解**即通过系数将解向量连接起来

1、**自由变量**不能全为零  2、**不同**的解向量线性**无关**

**2、非齐次线性方程组** $Ax = \beta$

题2. 求非齐次线性方程组$\begin{cases} x_1 + x_2 - x_3 - x_4 =   1 \\ 2x_1 + x_2 + x_3 + x_4 = 4 \\ 4x_1 + 3x_2 - x_3 - x_4 = 6 \\ x_1 + 2x_2 - 4x_3 - 4x_4 = -1 \end{cases}$  的解。

写出**增广矩阵**$(A:\beta)$，并进行**初等行变换**

1. **无解**

$R(A) \neq R(A:\beta)$

1. **有唯一解**

$R(A) = R(A:\beta) = n$

1. **有无穷多解**

$R(A) = R(A:\beta) < n$

- $A$ 是系数矩阵

- $(A:\beta)$ 是增广矩阵

- $R(\cdot)$ 表示矩阵的秩

- $n$ 是未知数的个数

非齐次方程通解$X$ $X=$(齐次通解+非齐次特解)

### 特征值、特征向量、对角化

**1、求特征值、特征向量**

- 给定方阵 $A \in \mathbb{R}^{n \times n}$。
- 如果存在标量 $\lambda \in \mathbb{R}$，和非零向量 $x \in \mathbb{R}^n$，使得：

$$
A x = \lambda x
$$

则称：

- $\lambda$ 是矩阵 $A$ 的**特征值** (eigenvalue)，
- $x$ 是对应的**特征向量** (eigenvector)。

题目：求矩阵$A = \begin{pmatrix} 3 & -1 \\ -1 & 3 \end{pmatrix}$的特征值    即求解$|A−λE|=0⇒λ$ 得到的$\lambda$即特征值。

求**特征向量**即$(A−λ_{i}E)x=0$的**基础解系**

**2、相似对角化**

若方阵 $A \in \mathbb{R}^{n \times n}$，存在可逆矩阵 $P$，使得
$$
P^{-1} A P = D
$$
其中 $D$ 是对角矩阵，则称 **$A$ 与 $D$ 相似**，称 $A$ **可相似对角化**。

解题方法： 

①求特征值\($\lambda_1,\lambda_2,\cdots,\lambda_m$\) ②求基础解系\($a_1,a_2\cdots a_m$\) ③\($P=(a_1,a_2\cdots a_m$)\)    $ P^{-1}AP=\begin{pmatrix}\lambda_1&&&\\&\lambda_2&&\\&&\ddots&\\&&&\lambda_m\end{pmatrix}$

**相似对角化的条件:**

**一个 $n$ 阶矩阵 $A$ 可以相似对角化，当且仅当 $A$ 有 $n$ 个线性无关的特征向量。**

**3、正交相似对角化**

解题方法:**1、求特征值 2、求基础解系 3、正交化 4、单位化**

正交：两个向量垂直

对称矩阵：**不同特征值对应的特征向量是正交的**

施密特正交化:$a_1a_2$

$b_1 = a_1$，$b_2 = a_2 - \frac{[a_2, b_1]}{[b_1, b_1]} \cdot b_1$

**单位化**：除以其值即可

**4、特征值的性质**

①$\lambda_1 + \lambda_2 + \cdots + \lambda_n = a_{11} + a_{22} + \cdots + a_{nn} \quad \text{（矩阵的迹：trA）}$


②$\lambda_1 \cdot \lambda_2 \cdot \cdots \cdot \lambda_n = |A|$

③ 若 $A$ 的特征值为 $\lambda$，则：

| 矩阵   | $kA$       | $A^2$       | $aA + bE$      | $A^m$       | $A^{-1}$             | $A^*$                  |
| ------ | ---------- | ----------- | -------------- | ----------- | -------------------- | ---------------------- |
| 特征值 | $k\lambda$ | $\lambda^2$ | $a\lambda + b$ | $\lambda^m$ | $\tfrac{1}{\lambda}$ | $\tfrac{\|A\|}{\lambda}$|

### 二次型

**1、二次型**

**二次型与二次型矩阵的关系**

对于 n 元二次型 $f(x_1, x_2, \dots, x_n)$，其一般形式可表示为:$f = \sum_{i=1}^n \sum_{j=1}^n a_{ij}x_ix_j \quad (a_{ij} = a_{ji}$) 对应的**二次型矩阵 A** 是一个 n 阶**对称矩阵**（满足 $A^T = A$），其中：

- 主对角线元素 $a_{ii}$ 是$x_{i}^2$项的系数
- 非主对角线元素 $ a_{ij} \ (i \neq j)$ 是$x_ix_j $ 项系数的一半,因为$x_ix_j$ 会被拆分为$a_{ij}x_ix_j + a_{ji}x_jx_i$，且$a_{ij} = a_{ji}$。

**2、求正交变换、化标准型**

步骤：**1、二次型矩阵 2、求特征值 3、求基础解析 4、正交化 5、单位化**

**3、顺序主子式**

通过其判断二次型是否正定

**定义**：取矩阵前 $k$ 行、前 $k$ 列构成的子式：
$$
\Delta_k = \det \begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1k} \\
a_{21} & a_{22} & \cdots & a_{2k} \\
\vdots & \vdots & \ddots & \vdots \\
a_{k1} & a_{k2} & \cdots & a_{kk}
\end{bmatrix}
$$
依次得到：

- $\Delta_1 = a_{11}$

- $\Delta_2 = \det \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}$

- $\Delta_3 = \det \begin{bmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{bmatrix}$

- … 直到 $\Delta_n = \det(A)$。

**顺序主子式与正定性（西尔维斯特判别法）**

对于对称矩阵 $A$，二次型 $x^T A x$ 正定性的判别方法：

- **正定** ⟺ 所有顺序主子式 $\Delta_1, \Delta_2, \dots, \Delta_n > 0$
- **负定** ⟺ 顺序主子式 $\Delta_1 < 0, \Delta_2 > 0, \Delta_3 < 0, \dots$（符号交替）

## 概率论


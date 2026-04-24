---
title: 力扣Hot100
description:  ​​力扣Hot100​​热门算法题库的题解，涵盖了​哈希、双指针、滑动窗口、子串、普通数组、矩阵、链表、回溯、贪心算法、动态规划​​等核心算法与数据结构。
date: 2025-08-22 10:15:04
updated: 2025-08-22 10:15:04
image: https://assets.yangzy.top/lkhot100.webp
# type: story
categories: [算法]
tags: [力扣]
---

## 哈希

### [两数之和](https://leetcode.cn/problems/two-sum/description/?envType=study-plan-v2&envId=top-100-liked)

有点困扰可能就是数据的返回形式，在 C++11 之后，C++支持列表初始化(list initialization)，也叫 **统一初始化**。

C++ 会自动根据函数的返回类型（这里是 `vector<int>`）把 `{i, j}` 当作构造这个 `vector` 的初始化列表。

```c++
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for(int i = 0; i < nums.size();i++)
        {
            for(int j = i + 1; j < nums.size();j++)
            {
                if(nums[i] + nums[j] == target)
                return {i,j};
            }
        }
        return {};
    }
};
```

### [字母异位词分组](https://leetcode.cn/problems/group-anagrams/?envType=study-plan-v2&envId=top-100-liked)

思路就是将**排序后的字符串**作为**分类依据**，因为异位词的话，排序得到的结果是**一样**的。

通过创建unordered_map，即**键值对（key-value)** 的集合。

**`map` = 有序(按key自动从小到大排序) + 红黑树**，**`unordered_map` = 无序 + 哈希表 + 快**

**key 唯一**，每个 key 对应一个 value。

**查找、插入、删除**的平均时间复杂度都是 **O(1)**。

`unordered_map<string, vector<string>> mp` 具体含义:

- `mp` 是一个哈希表。
- **key 类型**是 `string`，也就是说你可以通过字符串去查找。
- **value 类型**是 `vector<string>`，也就是 key 对应的是一个字符串数组

然后就是`emplace_back`，它是`vector`、`deque`、`list`等容器的方法，用来在**容器末尾直接构造元素**

它和`push_back()`的区别在于:

**`push_back`**：把一个已存在的对象 **拷贝或移动** 到容器末尾

**`emplace_back`**：**直接构造**对象在容器末尾，无需临时对象

```c++
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string,vector<string>> mp;	
        for(auto i : strs)
        {
            string key = i;
            sort(key.begin(),key.end());
            mp[key].emplace_back(i);
        }
        vector<vector<string>> ans;
        for(auto it = mp.begin(); it != mp.end();it++)
        {
            ans.emplace_back(it->second);
        }
        return ans;
    }
};
```

### [最长连续序列(set)](https://leetcode.cn/problems/longest-consecutive-sequence/)

很容易想到这道题就是排序，但是题目要求是时间复杂度为$O(n)$的时间复杂度。

用到了set结构。set是自动排序(自动升序)。但是用到了一个**count**函数来模拟排序，因此用`unordered_set`，其不会自动排序，但是查找更快。

**`set`**：有序、**不重复**，适合需要排序的场景。

**`unordered_set`**：无序、**不重复**，查找速度更快，适合只关心存在性而不关心顺序的场景。

`set`的**常用函数**如下:

| 函数                | 作用                            |
| ------------------- | ------------------------------- |
| `insert(x)`         | 插入元素                        |
| `erase(x)`          | 删除元素（值/迭代器）           |
| `find(x)`           | 查找元素，返回迭代器            |
| `count(x)`          | 判断元素是否存在（返回 0 或 1） |
| `begin() / end()`   | 迭代器遍历（升序）              |
| `rbegin() / rend()` | 迭代器遍历（降序）              |
| `size()`            | 集合大小                        |
| `empty()`           | 是否为空                        |
| `clear()`           | 清空集合                        |
| `lower_bound(x)`    | 返回 ≥ x 的第一个迭代器         |
| `upper_bound(x)`    | 返回 > x 的第一个迭代器         |

```c++
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> sets;
        for(auto i : nums) sets.insert(i);

        int ans = 0;
        for(auto i : sets)
        {
            if(!sets.count(i-1))//是连续序列的起点
            {
                int curNum = i;
                int curAns = 1;
                while(sets.count(curNum + 1))//查找后面的元素
                {
                    curNum ++;
                    curAns ++;
                }
                ans = max(ans,curAns);
            }
        }
        return ans;
    }
};
```

## 双指针

### [移动零](https://leetcode.cn/problems/move-zeroes/)

题目要求，必须在**不复制数组**的情况下原地对数组进行操作

思路是这样，**右指针**每次**不是0**就和左指针所指元素交换，每次交换后两指针++，不然只有右指针++

因为要把0一到数组的最后，因此要移动的数应该是右指针不为0

```c++
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int left = 0,right = 0;
        int n = nums.size();
        while(right < n)
        {
            if(nums[right] )
            {
                swap(nums[left],nums[right]);
                left++;
            }
            right++;
        }
    }
};
```

### [盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

```c++
[1, 8, 6, 2, 5, 4, 8, 3, 7]
 ^                       ^
```

在初始时，左右指针分别指向数组的左右两端，它们可以容纳的水量为 min(1,7)∗8=8。

此时我们需要移动一个指针。移动哪一个呢？直觉告诉我们，应该移动对应数字较小的那个指针（即此时的左指针）。这是因为，由于容纳的水量是由两个指针指向的数字中**较小值**∗**指针之间的距离**

如果我们移动数字较大的那个指针，那么前者「两个指针指向的数字中较小值」不会增加，后者「指针之间的距离」会减小，那么这个乘积会减小。因此，我们移动数字较大的那个指针是不合理的。因此，我们移动数字**较小**的那个指针。

```c++
class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0,r = height.size() - 1;
        int ans = 0;
        while(l < r){
            int area = min(height[l],height[r]) * (r - l);
            ans = max(ans,area);
            if(height[l] < height[r]) l++;
            else r--;
        }
        return ans;
    }
};
```

### [三数之和](https://leetcode.cn/problems/3sum/)

我们枚举的三元组$(a,b,c) $ 满足 $a≤b≤c$，保证了只有$(a,b,c) $  这个顺序会被枚举到，而 $(b,a,c)$、$(c,b,a)$ 等等这些不会，这样就减少了重复。

先对数组进行排序，方便去重，并使用双指针。固定一个数 `nums[i]`，问题就变成：
 **在 `i` 后面的数组里，找两个数 `nums[j]` 和 `nums[k]`，使得 `nums[j] + nums[k] = -nums[i]`。**
注意去重，避免结果重复

```c++
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        int n = nums.size();
        sort(nums.begin(),nums.end());
        vector<vector<int>> ans;

        //枚举a
        for(int i = 0; i < n; i ++)
        {
            //不是第一个可选元素时才跳过，因为第一个可能构成合法组合
            if(i > 0 && nums[i] == nums[i-1]) continue;
            int k = n - 1;
            int target = -nums[i];
            //枚举b
            for(int j = i + 1; j < n;j++){
                if(j > i + 1 && nums[j] == nums[j-1]) continue;
                while(j < k && nums[j] + nums[k] > target) k--;

                if(j == k) break;//指针相遇，随着 b 后续的增加
                // 就不会有满足 a+b+c=0 并且 b<c 的 c 了，可以退出循环
                if(nums[j] + nums[k] == target)
                    ans.push_back({nums[i],nums[j],nums[k]});
            }
        }
        return ans;
    }
};
```

### [接雨水](https://leetcode.cn/problems/trapping-rain-water/)

这道题用**动态规划**做比较好理解

创建两个长度为 n 的数组 $leftMax$ 和 $rightMax$。对于 $0≤i<n$，$$leftMax[i]$$ 表示下标$i$ 及其左边的位置中，$height$ 的最大高度，$rightMax[i]$ 表示下标 i 及其右边的位置中，$height $的最大高度。

显然，$leftMax[0]=height[0]$，$rightMax[n−1]=height[n−1]$。两个数组的其余元素的计算如下：

当 $1≤i≤n−1$ 时，$leftMax[i]=max(leftMax[i−1],height[i])$；

当 $0≤i≤n−2$ 时，$rightMax[i]=max(rightMax[i+1],height[i])$。

因此可以正向遍历数组 $height$ 得到数组 $leftMax$ 的每个元素值，反向遍历数组 height 得到数组 $rightMax$ 的每个元素值。

在得到数组 $leftMax $和 $rightMax$ 的每个元素值之后，对于 $0≤i<n$，下标$ i $处能接的雨水量等于 $min(leftMax[i],rightMax[i])−height[i]$。遍历每个下标位置即可得到能接的雨水总量。

```c++
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if(n == 0) return 0;

        vector<int> leftMax(n);
        //leftMax[i]表示下标i及其左边的位置中，height的最大高度
        leftMax[0] = height[0];
        for(int i = 1; i < n; i ++) leftMax[i] = max(leftMax[i-1],height[i]);

        vector<int> rightMax(n);
        rightMax[n-1] = height[n-1];
        for(int i = n - 2; i >= 0; i --) rightMax[i] = max(rightMax[i+1],height[i]);

        int ans = 0;
        for(int i = 0; i < n; i ++)
            ans += min(leftMax[i],rightMax[i]) - height[i];

        return ans;
    }
};
```

**双指针**的做法

注意到下标 $i$ 处能接的雨水量由 $\textit{leftMax}[i]$ 和 $\textit{rightMax}[i]$ 中的最小值决定。由于数组 $\textit{leftMax}$ 是从左往右计算，数组 $\textit{rightMax}$ 是从右往左计算，因此可以使用双指针和两个变量代替两个数组。

 维护两个指针 $\textit{left}$ 和 $\textit{right}$，以及两个变量 $\textit{leftMax}$ 和 $\textit{rightMax}$，初始时 $\textit{left} = 0$，$\textit{right} = n - 1$，$\textit{leftMax} = 0$，$\textit{rightMax} = 0$。指针 $\textit{left}$ 只会向右移动，指针 $\textit{right}$ 只会向左移动，在移动指针的过程中维护两个变量 $\textit{leftMax}$ 和 $\textit{rightMax}$ 的值。 

当两个指针没有相遇时，进行如下操作： 

- 使用 $\textit{height}[\textit{left}]$ 和 $\textit{height}[\textit{right}]$ 的值更新 $\textit{leftMax}$ 和 $\textit{rightMax}$ 的值；
- 如果 $\textit{height}[\textit{left}] < \textit{height}[\textit{right}]$，则必有 $\textit{leftMax} < \textit{rightMax}$，下标 $\textit{left}$ 处能接的雨水量等于 $\textit{leftMax} - \textit{height}[\textit{left}]$，将下标 $\textit{left}$ 处能接的雨水量加到能接的雨水总量，然后将 $\textit{left}$ 加 1（即向右移动一位）；
- 如果 $\textit{height}[\textit{left}] \geq \textit{height}[\textit{right}]$，则必有 $\textit{leftMax} \geq \textit{rightMax}$，下标 $\textit{right}$ 处能接的雨水量等于 $\textit{rightMax} - \textit{height}[\textit{right}]$，将下标 $\textit{right}$ 处能接的雨水量加到能接的雨水总量，然后将 $\textit{right}$ 减 1（即向左移动一位）。  

当两个指针相遇时，即可得到能接的雨水总量

就是每次判断在**两个**柱子中，**选择哪个柱子**接水。思路还是和动态规划一样，每次选择柱子两侧最大值的**最低点**来算。正如第一种情况的话，$i、j$两个柱子的话，因为$left$比$right$小了，那么$rightMax$一定会比$leftMax$大，又因为左边柱子的$leftMax$一定会比右边柱子的$rightMax$大，所以$min$的值就是$leftMax$，这里**省略**掉了只是。

```c++
class Solution {
public:
    int trap(vector<int>& height) {
        int ans = 0;
        int left = 0,right = height.size() - 1;
        int leftMax = 0,rightMax = 0;
        while(left < right){
            //leftMax表示下标left及其左边的位置中，height的最大高度
            leftMax=  max(leftMax,height[left]);
            //rightMax表示下标right及其右边的位置中，height的最大高度
            rightMax = max(rightMax,height[right]);

            if(height[left] < height[right]){
                //leftMax < rightMax 
                ans += leftMax - height[left];
                left++;
            }
            else
            {
                ans += rightMax - height[right];
                right--;
            }
        }
        return ans;
    }
};
```

## 滑动窗口

### [无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

```c++
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> occ;//哈希集合，记录当前窗口有哪些字符
        int n = s.size();
        //右指针初始为-1
        int rk = -1,ans = 0;
        //枚举左指针的位置
        for(int i = 0; i < n;i++)
        {
            if(i != 0) occ.erase(s[i-1]);
            while(rk + 1 < n && !occ.count(s[rk+1])){
                //不断移动右指针
                occ.insert(s[rk+1]);
                rk++;
            }
            ans = max(ans,rk - i + 1);//每次计算不重复的长度
        }
        return ans;
    }
};
```

### [找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

```c++
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        int slen = s.size(),plen = p.size();

        if(slen < plen) return vector<int>();

        vector<int> ans;
        vector<int> sCount(26);
        vector<int> pCount(26);

        //先初始化前plen个字符的频次
        for(int i = 0; i < plen;i++)
        {
          sCount[s[i]-'a']++;
          pCount[p[i]-'a']++;
        }
        //s与p完全相同
        if(sCount == pCount) ans.emplace_back(0);

        for(int i = 0; i < slen - plen;i++)
        {
            sCount[s[i]-'a']--;//移出窗口左端
            sCount[s[i+plen]-'a']++;//窗口右端进入
            if(sCount == pCount) ans.emplace_back(i+1);
        }
        return ans;
    }
};
```

## 子串

### [和为 K 的子数组(map)](https://leetcode.cn/problems/subarray-sum-equals-k/)

为什么先放**mp[0] = 1**？表示“在任何数之前”有一个“前缀和为 0” 的情况。这样如果一开始累计到的前缀和本身就等于 k（即 pre == k），那么 pre - k == 0，就能正确计数到这个从 0 开始的子数组。

**类比**:你在走路（遍历数组），手里累加步数（前缀和 pre）。你想知道有没有一段路程长度为 k。只要你当前的总步数 pre 与过去某次的总步数 old 之差是 k，即 old = pre - k，就说明那段之间的路长是 k。于是你每走一步就问：之前有多少次总步数等于 pre - k？有几次就有几个合法子数组。

`unordered_map<K, V>`：键值对容器，**键**是 `K` 类型，**值**是 `V` 类型

`mp.find(key)`：在 `unordered_map` 里查找是否存在键为 `key` 的元素。

- **如果存在**：返回指向该元素的迭代器（不是值）
- **如果不存在**：返回 `mp.end()`（尾后迭代器）
- `key`**唯一**

`map`与`unordered_map`的**区别**：

1. 底层结构 

   map：平衡二叉搜索树（C++ 标准里通常是红黑树） 

   unordered_map：哈希表（数组 + 链表/桶，或拉链法，具体实现取决于库）

2. 键的顺序 

   map：迭代时按 key 从小到大有序 

   unordered_map：无序（遍历顺序和插入、rehash 等相关，不可依赖）

 `mp[pre]`

当你用 **下标运算符 `[]`** 访问一个键 `pre` 时：

 - **如果这个键存在**，就返回它对应的 `value` 的引用。
 - **如果这个键不存在**，就会 **自动插入** 一个新的键值对：

```c++
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int,int> mp;
        //mp[sum]=cnt表示前缀和为sum的情况出现过cnt次
        mp[0] = 1;
        int count = 0,pre = 0;
        for(auto &x : nums)
        {
            pre += x;
            if(mp.find(pre-k) != mp.end()) count += mp[pre-k];
            mp[pre]++;
        }
        return count;
    }
};
```

### [滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

队列的性质是**先进先出**

`deque`（双端队列）

- 全称 **double-ended queue**，存储结构是一个 **动态数组块链表**（不是连续的大数组，扩展时比 `vector` 高效）。

- 特点：

  - **两端都能高效插入和删除**（`push_front` / `pop_front` / `push_back` / `pop_back`）。

  - 随机访问（`[]` 运算符）和迭代器可用，类似 `vector`。

`queue`（队列）

- **容器适配器**，默认基于 `deque` 实现。
- 特点：
 **只能从一端进，另一端出**（FIFO，先进先出）。
  接口比 `deque` 少很多，只允许：`push()`：入队（尾部），`pop()`：出队（头部），`front()`：访问队头，`back()`：访问队尾
- 不能随便访问中间元素。

我们用 **双端队列 `deque` 保存索引**，保证：

1. 队头 `q.front()` 总是窗口的最大值索引。
2. 队列从前到后递减（对应 `nums` 的值递减）。

维护一个**单调递减**的队列，元素是**下标**，队首是窗口里最大元素的下标，遍历数组，首先判断最大元素是否还在窗口里，然后将队列里小于当前新加入元素的老元素去掉（因为只要新元素在窗口，在老元素右边，它们就不可能是滑动窗口的最大值），然后加入这个新元素，遍历时记录队首的最大值即可。

`nums[q[0]] >= nums[q[1]] >= nums[q[2]] ...`，队列中只存**当前**窗口范围内的下标。

如何维持这个结构：

- 插入新元素 i 之前：把队尾那些值 <= 新值 的下标全部弹掉，因为它们永远不可能再成为最大值（被更靠右且不更小的值遮蔽）。
- 把 i 放到队尾。
- 再把队头如果已经滑出窗口（下标 <= i - k）就弹掉。

```c++
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        deque<int> q;
        for(int i = 0; i < k;i++)//先处理前k个元素，形成第一个窗口
        {	//把所有比当前元素小（或相等）的尾部下标移除
            while(!q.empty() && nums[i] >= nums[q.back()]) q.pop_back();
            q.push_back(i);
        }// 此时队头就是第一个窗口最大值的下标
        vector<int> ans = {nums[q.front()]};
        for(int i = k; i < n;i++)//继续处理后面的元素 i = k ... n-1
        {	//插入新元素之前，清理掉尾部不可能再用的
            while(!q.empty() && nums[i] >= nums[q.back()]) q.pop_back();
            q.push_back(i);
            //窗口现在是[i-k+1,i],如果队头已经出界就弹掉
            while(q.front() <= i - k) q.pop_front();
            ans.push_back(nums[q.front()]);//队头就是当前窗口最大值
        }
        return ans;        
    }
};
```

### [最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

思路：**滑动窗口**

在滑动窗口类型的问题中都会有两个指针，一个用于「延伸」现有窗口的 r 指针，和一个用于「收缩」窗口的 l 指针。在任意时刻，只有一个指针运动，而另一个保持静止。**我们在 s 上滑动窗口，通过移动 r 指针不断扩张窗口。当窗口包含 t 全部所需的字符后，如果能收缩，我们就收缩窗口直到得到最小窗口。**

```c++
class Solution {
public:
    unordered_map<char,int> ori,cnt;//cnt当前窗口各字符出现次数

    bool check(){//判断当前窗口是否已经覆盖t
        for(const auto &p : ori) 
            if(cnt[p.first] < p.second) return false;
        return true;
    }
    string minWindow(string s, string t) {
        for(const auto &c:t) ori[c]++;//字符串t中每个字符出现次数(目标)

        int l = 0, r = -1;
        int len = INT_MAX,ansL = -1, ansR = -1;//最优的窗口左右边界
		//len记录目前找到的最短合法窗口长度
        while(r < int(s.size())){
            if(ori.find(s[++r]) != ori.end()) cnt[s[r]]++;

            while(check() && l <= r)//如果满足条件，尝试缩短窗口
            {
                if(r - l + 1 < len){
                    len = r - l + 1;
                    ansL = l;
                }
                if(ori.find(s[l]) != ori.end()) cnt[s[l]]--;//如果是目标字符，更新出现次数
                l++;
            } 
        }
        return ansL == -1?string():s.substr(ansL,len);//从ansl起，取长度为len的子串
    }
};
```

## 普通数组

### [最大子数组和](https://leetcode.cn/problems/maximum-subarray/)

```c++
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int pre = 0,maxAns = nums[0];
        for(auto x : nums){
            pre = max(pre+x,x);//pre记录以当前元素结尾的连续子数组的最大和
            maxAns = max(maxAns,pre);
        }
        return maxAns;
    }
};
```

### [合并区间](https://leetcode.cn/problems/merge-intervals/)

默认 `sort` 对 `vector<int>` 是按 **字典序** 排序。

对 `vector<vector<int>>` 就是 **先比较第一列，再比较第二列...**。

 `vector::back()` 的作用

在 C++ STL 里，`back()` 是 `vector` 的一个成员函数，功能是：

**返回容器中最后一个元素的引用**。

首先，我们将列表中的区间按照左端点升序排序。然后我们将第一个区间加入 merged 数组中，并按顺序依次考虑之后的每个区间：
如果当前区间的**左端点**在数组 merged 中最后一个区间的**右端点**之后，那么它们不会重合，我们可以直接将这个区间加入数组 merged 的末尾；
否则，它们**重合**，我们需要用**当前**区间的**右端点**更新数组 merged 中最后一个区间的右端点，将其置为二者的较大值。

```c++
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if(intervals.size() == 0) return {};

        sort(intervals.begin(),intervals.end());
        vector<vector<int>> merged;
        for(int i = 0; i < intervals.size();i++)
        {
            int L = intervals[i][0],R = intervals[i][1];
            if(!merged.size() || merged.back()[1] < L) merged.push_back({L,R});
            else merged.back()[1] = max(merged.back()[1],R);
        }
        return merged;
    }
};
```

### [轮转数组](https://leetcode.cn/problems/rotate-array/)

🔹 `vector::assign` 的作用

`assign` 是 `std::vector` 的一个成员函数，用来把容器里的内容替换成新的内容

`assign` 会 **替换元素、修改 size**。

它不直接关心原来的容量，但如果原容量不够，会自动扩容。

```c++
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> newArr(n);
        for(int i = 0; i < n; i ++)
        {
            newArr[(i+k)%n] = nums[i];
        }
        nums.assign(newArr.begin(),newArr.end());
        //nums = newArr;
    }
};
```

### [除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/)

```c++
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int length = nums.size();
        vector<int> answer(length);

        //answer[i]表示索引左侧所有元素的乘积
        answer[0] = 1;
        for(int i = 1;i < length;i++) answer[i] = nums[i-1] * answer[i-1];

        //R为右侧所有元素的乘积
        int R = 1;
        for(int i = length-1;i >= 0; i --)
        {
            answer[i] = answer[i] * R;
            R *= nums[i];
        }
        return answer;
    }
};
```

### [缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/)

我们的思路是首先，**正数**的范围为$[1,N+1]$，为$N+1$是$[1,N]$都出现，则$N+1$是缺少的数,其余则是$[1,N]$然后，将数组中出现的正数进行标记，对于负数和0则不标记，那么，从小到大，没标记的第一个正整数就是缺失的数。

具体来说，对于遍历到的数$x$ ，如果它在 $[1,N]$的范围内，那么就将数组中的第 $x−1$个位置打上标记

**也就是说**，数组下标$i$对应着正数$i+1$，第一个没被标记的位置，其就是答案，对应的数为$i+1$

```python
class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n):
            if nums[i] <= 0: nums[i] = n + 1
        for i in range(n):
            num = abs(nums[i])
            if num <= n: # 原来是正数
                nums[num-1] = -abs(nums[num-1])
        for i in range(n):
            if nums[i] > 0: return i + 1
        
        return n + 1

```

## 矩阵

### [矩阵置零(set)](https://leetcode.cn/problems/set-matrix-zeroes/)

这里一开始我想用`find()`和`count()`但是想到只有`set`和`map`这两种容器有(并且都是不允许**重复**的)。`set` 只存**元素**，`map` 存**键值对**

**序列容器（vector/deque/list）**

- 支持 `push_back` / `push_front` / `insert`

- 支持就地构造 `emplace_back` / `emplace_front` / `emplace(iterator, ...)`

> **注意**：`std::vector` 没有 `push_front`，因为在开头插入元素效率低（需要移动整个数组）。

**关联容器（set/multiset/map/multimap）**

- 没有“末尾/前端”的概念 → 没有 `push_back` / `push_front`
- 插入用 `insert()` 或 `emplace()`，支持就地构造

下面是我的做法，通过利用2个set来存储出现0的位置，如果出现就将其变为0，否则不做变化。

```c++
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        set<int> row,col;//行、列
        int m = matrix.size(),n = matrix[0].size();
        for(int i = 0; i < m; i ++)
            for(int j = 0; j < n; j++)
            {
                if(matrix[i][j] == 0)
                {
                    row.emplace(i);
                    col.emplace(j);
                }
            }
        for(int i = 0; i < m; i ++)
        {
            for(int j = 0; j < n; j++)
            {
                if(row.find(i) != row.end()|| col.find(j) != col.end()) matrix[i][j] = 0;
                else {}
                cout << matrix[i][j] << " ";
            }
            cout << endl;
        }
    }
};
```

### [螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/)

当路径超出界限或者进入之前访问过的位置时，顺时针旋转，进入下一个方向

```c++
class Solution {
private:
    //右下左上
    static constexpr int dir[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        if (matrix.size() == 0 || matrix[0].size() == 0) {
            return {};
        }
        int rows = matrix.size(), columns = matrix[0].size();//行、列
        vector<vector<bool>> visited(rows, vector<bool>(columns));
        int total = rows * columns;
        vector<int> order(total);//答案数组

        int row = 0, column = 0;
        int dirId = 0;
        for (int i = 0; i < total; i++) {
            order[i] = matrix[row][column];
            visited[row][column] = true;
            int nextRow = row + dir[dirId][0], nextColumn = column + dir[dirId][1];//下一步的坐标
            if (nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns || visited[nextRow][nextColumn]) {
                dirId = (dirId + 1) % 4;
            }
            row += dir[dirId][0];
            column += dir[dirId][1];
        }
        return order;
    }
};

```

### [旋转图像](https://leetcode.cn/problems/rotate-image/description/?envType=study-plan-v2&envId=top-100-liked)

> 关键是在对于矩阵中第$ i$ 行的第$j$个元素，在旋转后，它出现在倒数第$ i $列的第$ j $个位置。

我们将其翻译成代码。由于矩阵中的行列从$ 0 $开始计数，因此对于矩阵中的元素$ matrix[row][col]$，在旋转后，它的新位置为$ matrix_{new}[col][n-1-row]$

参考题解:[旋转图像](https://leetcode.cn/problems/rotate-image/solutions/526980/xuan-zhuan-tu-xiang-by-leetcode-solution-vu3m/?envType=study-plan-v2&envId=top-100-liked)	

关键是在推出每个点的旋转涉及到四个点时，应该**旋转哪些点**。

```c++

class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();

        for(int i = 0; i < n / 2; i ++)
            for(int j = 0; j < (n + 1) / 2;j++)
            {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[n - j - 1][i];
                matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1];
                matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1];
                matrix[j][n - i - 1] = tmp;
            }
    }
};
```

### [搜索二维矩阵 II](https://leetcode.cn/problems/search-a-2d-matrix-ii/description/?envType=study-plan-v2&envId=top-100-liked)

直接暴力枚举，因为数据较小，不会超时

```c++
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int n = matrix.size(),m = matrix[0].size();
        for(int i = 0; i < n;i++)
        for(int j = 0; j < m;j++)
        {
            if(matrix[i][j] == target) return true;
        }
        return false;
    }
};
```

但是这种并不**高效**。

**每行二分查找**，复杂度 $O(m log n)$，$m$ 行$ n$ 列。

核心点：`lower_bound` 找到第一个 $≥ target$ 的位置，然后判断是否等于$ target$。

介绍下`lower_bound`函数：

**功能**：在 `[first, last)` 范围内查找 **第一个不小于 value 的元素位置**。

**要求**：区间必须 **已排序**（升序）才能正确工作。

**返回值**：一个**迭代器**，指向 **第一个 >= value 的元素**。

- 如果所有元素都小于 value，返回 `last`（即末尾迭代器）。

```c++
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for(const auto& row : matrix)
        {
            auto it = lower_bound(row.begin(),row.end(),target);
            if(it != row.end() && *it == target) return true;
        }
        return false;
    }
};
```

### [划分字母区间](https://leetcode.cn/problems/partition-labels/)

要求片段数**尽可能的多**，同时**一个字母只能出现在一个片段中**。

```c++
class Solution {
public:
    vector<int> partitionLabels(string s) {
        int last[26];
        int length = s.size();
        for(int i = 0; i < length; i ++) last[s[i] - 'a'] = i;//记录每个字母出现的下标

        vector<int> partition;
        int start = 0,end = 0;
        for(int i = 0; i < length;i++){
            end = max(end,last[s[i]-'a']);
            if(i == end){
                partition.push_back(end-start+1);
                start = end + 1;
            }
        }
        return partition;
    }
};
```

## 链表

### [相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/)

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        unordered_set<ListNode*> visited;
        ListNode *temp = headA;
        while(temp != NULL){
            visited.insert(temp);
            temp = temp->next;
        }
        temp = headB;
        while(temp != NULL){
            if(visited.count(temp)) return temp;
            temp = temp->next;
        }
        return NULL;
    }
};
```

### [反转链表](https://leetcode.cn/problems/reverse-linked-list/)

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;// 反转后链表的头，一开始为空
        ListNode* cur = head;
        while(cur){
            ListNode* next = cur->next;// 1. 保存下一个节点
            cur->next = prev;//2. 进行翻转
            prev = cur;//3. 将头节点前进
            cur = next;//4. 下一个节点
        }
        return prev;
    }
};
```

### [回文链表](https://leetcode.cn/problems/palindrome-linked-list/)

指针存的是地址.

通过快慢指针，得到中点位置，然后对两段进行比较。

```c++
class Solution {
public:
    bool isPalindrome(ListNode* head) {
        if (!head || !head->next) return true;

        // 1. 快慢指针找中点
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        // 此时 slow 在“前半段的末尾”：
        // n 为偶数：slow 在左中点
        // n 为奇数：slow 在真正中点的位置（下一步反转从 slow->next 开始）

        // 2. 反转后半部分
        ListNode* second = reverseList(slow->next);

        // 3. 比较前半部分和反转后的后半部分
        ListNode* p1 = head;
        ListNode* p2 = second;
        bool res = true;
        while (p2) {
            if (p1->val != p2->val) {
                res = false;
                break;
            }
            p1 = p1->next;
            p2 = p2->next;
        }
        return res;
    }

    ListNode* reverseList(ListNode* head) {//返回头节点
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};

```

### 环形链表

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    bool hasCycle(ListNode *head) {
        unordered_set<ListNode*> seen;
        while(head != NULL){
            if(seen.count(head)) return true;
            seen.insert(head);
            head = head->next;
        } 
        return false;
    }
};
```

### [环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/)

```c++
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode *detectCycle(ListNode *head) {
        unordered_set<ListNode*> seen;
        while(head != NULL)
        {
            if(seen.count(head)) return head;
            seen.insert(head);
            head = head->next;
        }
        return NULL;
    }
};
```

### [合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)

### [随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/)

```py
class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        cur = head
        while cur:
            cur.next = Node(cur.val,cur.next)
            cur = cur.next.next # 跳过复制节点

        cur = head
        # cur原节点，cur.next是对应的复制节点
        while cur:
            if cur.random:
                cur.next.random = cur.random.next
            cur = cur.next.next

        cur = dummy = Node(0,head)# 拆分新旧链表
```

### [排序链表](https://leetcode.cn/problems/sort-list/)

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def middleNode(self,head:Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            pre = slow
            slow = slow.next
            fast = fast.next.next
        pre.next = None
        return slow 

    def mergeTwoLists(self,list1:Optional[ListNode],list2:Optional[ListNode])->Optional[ListNode]:
        cur = dummy =  ListNode()
        while list1 and list2:
            if list1.val < list2.val:
                cur.next = list1
                list1 = list1.next
            else:
                cur.next = list2
                list2 = list2.next
            cur = cur.next
        cur.next = list1 if list1 else list2
        return dummy.next

    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if head is None or head.next is None:
            return head
        
        head2 = self.middleNode(head)

        head = self.sortList(head)
        head2 = self.sortList(head2)

        return self.mergeTwoLists(head,head2)
        
```

### [合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

ListNode.__lt__ = lambda a,b: a.val < b.val
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        cur = dummy = ListNode()
        h = [head for head in lists if head]
        heapify(h) # 调整为堆
        while h:
            node = heappop(h)
            if node.next:
                heappush(h,node.next)
            cur.next = node
            cur = cur.next
        return dummy.next
```

### [LRU 缓存](https://leetcode.cn/problems/lru-cache/)

```python
class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key,last = False)#移到最前
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        self.cache[key] = value
        self.cache.move_to_end(key,last = False)
        if len(self.cache) > self.capacity:
            self.cache.popitem()#去掉最后一个
```

## 二叉树

### [二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

```python
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        def dfs(node:Optional[TreeNode]) ->None:
            if node is None:
                return
            dfs(node.left)
            ans.append(node.val)
            dfs(node.right)

        ans = []
        dfs(root)
        return ans
```

### [二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

```python
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:return 0
        return max(self.maxDepth(root.left),self.maxDepth(root.right)) + 1
```

### [翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

```python
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root is None: return
        tmp = root.left
        root.left = self.invertTree(root.right)
        root.right = self.invertTree(tmp)
        return root
```

### [对称二叉树](https://leetcode.cn/problems/symmetric-tree/)

```python
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def recur(L,R):
            if not L and not R: return True
            if not L or not R or L.val != R.val: return False
            return recur(L.left,R.right) and recur(L.right,R.left)
        
        return not root or recur(root.left,root.right)
```

### [二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

```python
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        ans = 0
        def dfs(node:Optional[TreeNode]) ->int:
            if node is None:
                return -1
            l_len = dfs(node.left) + 1 # +1：把“当前节点到左孩子”这条边也算上
            r_len = dfs(node.right) + 1
            nonlocal ans
            ans = max(ans,l_len + r_len)#从左边最深的节点 → 当前节点 → 右边最深的节点
            return max(l_len,r_len)
        dfs(root)   
        return ans
```

### [二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

```python
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:return []
        res,queue = [],collections.deque() # 双端队列
        queue.append(root)
        while queue:
            tmp = []
            for _ in range(len(queue)):
                node = queue.popleft()
                tmp.append(node.val)
                if node.left: queue.append(node.left)
                if node.right: queue.append(node.right)
            res.append(tmp)
        
        return res
```

### [将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

```python
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        if not nums:
            return None
        m = len(nums) // 2
        left = self.sortedArrayToBST(nums[:m])
        right = self.sortedArrayToBST(nums[m+1:])
        return TreeNode(nums[m],left,right)
```

### [验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

```python
class Solution:
    def isValidBST(self, root: Optional[TreeNode],left = -inf,right =  inf) -> bool:
        if root is None:
            return True
        x = root.val
        return left < x < right and \
        self.isValidBST(root.left,left,x) and \
        self.isValidBST(root.right,x,right)
```

### [二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

```python
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        ans = 0
        def dfs(node:Optional[TreeNode]) ->None:
            nonlocal k,ans
            if node is None or k <= 0:
                return 
            dfs(node.left)
            k -= 1
            if k == 0 :
                ans = node.val
            dfs(node.right)
        dfs(root)
        return ans
```

### [二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)

```python
class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        def dfs(node:Optional[TreeNode],depth:int) ->None: # depth当前节点在第几层
            if node is None:
                return 
            if depth == len(ans):
                ans.append(node.val)
            dfs(node.right,depth+1)
            dfs(node.left,depth+1)
        dfs(root,0)
        return ans
```

### [二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

```python
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        preorderList = list()

        def preorderTraversal(root:TreeNode):
            if root:
                preorderList.append(root)
                preorderTraversal(root.left)
                preorderTraversal(root.right)

        preorderTraversal(root)
        size = len(preorderList)
        for i in range(1,size):
            prev,cur = preorderList[i-1],preorderList[i]
            prev.left = None
            prev.right = cur
```

### [从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

```python
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        index = {x:i for i,x in enumerate(inorder)}#值 -> 它在中序遍历里的下标

        #当前子树在preorder里用的是preorder[pre_l:pre_r](左闭右开)，当前子树在inorder里是从 in_l开始的
        def dfs(pre_l:int,pre_r:int,in_l:int) -> Optional[TreeNode]:
            if pre_l == pre_r:
                return None
            left_size = index[preorder[pre_l]] - in_l
            left = dfs(pre_l + 1,pre_l+1+left_size,in_l)
            right = dfs(pre_l+1+left_size,pre_r,in_l+1+left_size)
            return TreeNode(preorder[pre_l],left,right)

        return dfs(0,len(preorder),0)
```

### [路径总和 III](https://leetcode.cn/problems/path-sum-iii/)

```python
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        prefix = collections.defaultdict(int)
        prefix[0] = 1 #prefix[x]表示在当前这条从根往下走的路径上，前缀和等于x的情况出现了几次

        def dfs(root,cur):# 到当前节点为止(包含当前节点)，前缀和是cur
            if not root:
                return 0

            ret = 0
            cur += root.val
            ret += prefix[cur - targetSum]
            prefix[cur] += 1
            ret += dfs(root.left,cur)
            ret += dfs(root.right,cur)
            prefix[cur] -= 1 # 回溯

            return ret
        
        return dfs(root,0)
```

### [二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

```python
class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        if not root or root == p or root == q: return root
        left = self.lowestCommonAncestor(root.left,p,q)
        right = self.lowestCommonAncestor(root.right,p,q)
        if not left:return right
        if not right: return left
        return root # 左右子树都没找到的话
```

### [二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

```python
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        ans = -inf
        def dfs(node:Optional[TreeNode]) -> int:# 从node出发，向下延伸的一条路径，最大能提供多少收益
            if node is None:
                return 0
            l_val = dfs(node.left) # 左子树能提供的最大收益
            r_val = dfs(node.right) # 右子树能提供的最大收益
            nonlocal ans
            ans = max(ans,l_val+r_val+node.val) # 更新全局最大路径和
            return max(max(l_val,r_val)+node.val,0)
        dfs(root)
        return ans  
```

## 图论

### [岛屿数量](https://leetcode.cn/problems/number-of-islands/)

 `enumerate(grid)` 每次给的不是一个值，而是**两个值组成的一对**：(下标, 元素)

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m,n= len(grid),len(grid[0])


        def dfs(i:int,j:int) -> None:
            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':
                return 
            grid[i][j] = '2'
            dfs(i,j-1)
            dfs(i,j+1)
            dfs(i-1,j)
            dfs(i+1,j)

        ans = 0
        for i,row in enumerate(grid):
            for j,c in enumerate(row):
                if c == '1':
                    ans += 1
                    dfs(i,j)

        
        return ans
```

### [腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/)

```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m,n = len(grid),len(grid[0])
        fresh = 0
        q = []
        for i,row in enumerate(grid):
            for j,x in enumerate(row):
                if x == 1:
                    fresh += 1
                elif x == 2:
                    q.append((i,j))
        
        ans = 0
        while q and fresh: # 不加fresh会在腐烂完后ans再加1
            ans += 1
            tmp = q
            q = []
            for x,y in tmp:
                for i,j in (x-1,y),(x+1,y),(x,y-1),(x,y+1):
                    if 0 <= i < m and 0 <= j < n and grid[i][j] == 1:
                        fresh -= 1
                        grid[i][j] = 2
                        q.append((i,j))
        
        return -1 if fresh else ans
```

### [课程表](https://leetcode.cn/problems/course-schedule/)

```python
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        g = [[] for _ in range(numCourses)]
        for a,b in prerequisites:
            g[b].append(a) # b是先修课程

        colors = [0] * numCourses
        def dfs(x:int) -> bool: # 从x出发，是否能找到环
            colors[x] = 1 #  x 正在访问中
            for y in g[x]:
                if colors[y] == 1 or colors[y] == 0 and dfs(y):
                    return True
            
            colors[x] = 2 # x完全访问完毕，从x出发无法找到环
            return False

        for i,c in enumerate(colors):
            if c == 0 and dfs(i): # 图可能不是连通的
                return False
        return True
```

### [实现 Trie (前缀树)](https://leetcode.cn/problems/implement-trie-prefix-tree/)

```python
class Node:
    __slots__ = 'son','end' #这个类的对象只允许有son和end这两个属性
    def __init__(self):
        self.son = {} # 从当前节点出发,下一个字符能走到谁
        self.end = False # 表示这个节点是不是某个完整单词的结尾

class Trie:

    def __init__(self):
        self.root = Node()

    def insert(self, word: str) -> None:
        cur = self.root
        for c in word:
            if c not in cur.son:
                cur.son[c] = Node()
            cur = cur.son[c]
        cur.end = True

    def find(self,word:str) ->int:
        cur = self.root
        for c in word:
            if c not in cur.son:
                return 0
            cur = cur.son[c]
        return 2 if cur.end else 1 # 2--是一个完整单词，1--路径存在，但不是完整单词结尾

    def search(self, word: str) -> bool:
        return self.find(word) == 2

    def startsWith(self, prefix: str) -> bool:
        return self.find(prefix) != 0
```

## 回溯

### [全排列](https://leetcode.cn/problems/permutations/)

```c++
class Solution {
public:     //output是待排列数组
    void backtrack(vector<vector<int>>& res,vector<int>& output,int first,int len)
    {//len数组长度，first当前填充位置
        if(first == len){
            res.emplace_back(output);
            return;
        }
        for(int i = first;i < len;i++){//按位置考虑
            swap(output[i],output[first]);
            backtrack(res,output,first+1,len);
            swap(output[i],output[first]);
        }
    }
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> res;
        backtrack(res,nums,0,(int)nums.size());
        return res;
    }
};
```

### [子集](https://leetcode.cn/problems/subsets/)

```python
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = []
        path = []

        def dfs(i :int) -> None: # i表示当前已经选了几个数
            if i == n:
                ans.append(path.copy())
                return 
            
            dfs(i+1) # 不选

            path.append(nums[i])# 选
            dfs(i+1) 
            path.pop() # 恢复现场，别的子集不一定选该元素

        dfs(0)
        return ans
```

### [电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/)

```python
MAPPING = "","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        n = len(digits)
        if n == 0:
            return []
        
        ans = []
        path = ['']*n # 用来存放当前正在拼的那个字符串

        def dfs(i : int) -> None: # 当前正在处理第i位数字，从0开始
            if i == n:
                ans.append(''.join(path))
                return
            for c in MAPPING[int(digits[i])]:
                path[i] = c # 直接覆盖
                dfs(i+1)
            
        dfs(0)
        return ans
```

### [组合总和](https://leetcode.cn/problems/combination-sum/)

```python
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        ans = []
        path = []

        def dfs(i:int,left:int) -> None:
            if left == 0:
                ans.append(path.copy())
                return
            
            if i == len(candidates) or left < candidates[i]:
                return
            dfs(i+1,left)

            path.append(candidates[i])
            dfs(i,left-candidates[i])
            path.pop()


        dfs(0,target)
        return ans 
```

### [括号生成](https://leetcode.cn/problems/generate-parentheses/)

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        path=[''] * (n*2)

        def dfs(left: int,right:int) -> None:
            if right == n:
                ans.append(''.join(path))
                return 
            
            if left < n:
                path[left+right] = '(' # 已经放了left + right 个字符，下一个位置自然是left+right
                dfs(left+1,right)
            if right < left:
                path[left+right] = ')'
                dfs(left,right+1)
            
        
        dfs(0,0)
        return ans
```

### [单词搜索](https://leetcode.cn/problems/word-search/)

```python
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        cnt = Counter(c for row in board for c in row)
        if not cnt >= Counter(word):
            return False
        if cnt[word[-1]] < cnt[word[0]]: # 最后一个字母更少，反向搜索
            word = word[::-1]

        m,n = len(board),len(board[0])
        def dfs(i:int,j:int,k:int) -> bool: #当前来到格子 (i, j)，要匹配word[k]
            if board[i][j] != word[k]:
                return False
            if k == len(word) - 1: # 最后一个字符，并且相等
                return True
            board[i][j] = ''
            for x,y in(i,j-1),(i,j+1),(i-1,j),(i+1,j):
                if 0 <= x < m and 0 <= y < n and dfs(x,y,k+1):
                    return True
            
            board[i][j] = word[k]
            return False
        return any(dfs(i,j,0) for i in range(m) for j in range(n))
```

### [分割回文串](https://leetcode.cn/problems/palindrome-partitioning/)

```python
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        ans = []
        path = [] # path：存当前这一种切法
        def dfs(i:int)->None: # 从s[i]开始切
            if i == n:
                ans.append(path.copy())
                return
            for j in range(i,n):
                t = s[i:j+1]
                if t == t[::-1]:
                    path.append(t)
                    dfs(j+1)
                    path.pop() # 改了公共变量所以要回溯
        
        dfs(0)
        return ans  
```



### [N 皇后](https://leetcode.cn/problems/n-queens/)

`clear()`作用是清空里面的内容。

`assign` 是 **STL 容器的方法**（如 `vector`, `string`, `deque`, …），作用是**把容器重新赋值（替换内容）**。 它和 `=` 类似，但更灵活

```c++
class Solution {
public:
    vector<vector<string>> res;  // 存所有解
    vector<string> board;        // 当前棋盘
    vector<bool> col, dg, udg;   // 列、主对角线、副对角线
    int n;

    void dfs(int r) {//当前考虑到了第几行
        if (r == n) {
            res.push_back(board); // 保存当前解
            return;
        }
        for (int i = 0; i < n; i++) {//考虑列的填充(r行i列)
            if (!col[i] && !dg[r + i] && !udg[i - r + n]) {//当前位置能填的话
                col[i] = dg[r + i] = udg[i - r + n] = true;
                board[r][i] = 'Q';
                dfs(r + 1);
                board[r][i] = '.';
                col[i] = dg[r + i] = udg[i - r + n] = false;
            }
        }
    }

    vector<vector<string>> solveNQueens(int _n) {
        n = _n;
        res.clear();
        board = vector<string>(n, string(n, '.'));
        col.assign(n, false);
        dg.assign(2 * n, false);//对角线
        udg.assign(2 * n, false);
        dfs(0);
        return res;
    }
};

```

## 二分查找

二分的**条件**：

>能不能找到一个条件，使得数组被分成两段。
>
>一段都满足这个条件，另一段都不满足这个条件。

### [搜索插入位置](https://leetcode.cn/problems/search-insert-position/)

库函数：

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        return bisect_left(nums,target)
   """
   nums 是升序有序的，bisect_left(nums, target) 返回的是
   如果 target 在数组里，返回它最左边出现的位置
   如果 target 不在数组里，返回它应该插入的位置
   """
```

闭区间：

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        left,right = 0,len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return left
```

### [搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/)

闭区间：

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m,n = len(matrix),len(matrix[0])
        left,right = 0,m*n - 1
        while left  <= right:
            mid = (left+right) // 2
            x = matrix[mid // n][mid % n]
            if x == target:
                return True
            if x < target:
                left = mid + 1
            else:
                right = mid - 1
        return False
```

### [在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

```python
class Solution:
    def lower_bound(self,nums:List[int],target:int)->int:
        left,right = 0,len(nums)-1
        while left <= right:
            mid = (left+right) // 2
            if nums[mid] >= target:
                right = mid -1
            else:
                left = mid + 1
        return left # 第一个大于等于target的位置
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        start = self.lower_bound(nums,target)
        if start == len(nums) or nums[start] != target:
            return [-1,-1]
        end =  self.lower_bound(nums,target+1) - 1
        return [start,end]
```

### [搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

```python
class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1
        ans = 0

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] <= nums[-1]:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1

        return ans

    def lower_bound(self, nums: List[int], left: int, right: int, target: int) -> int:
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return left if left < len(nums) and nums[left] == target else -1

    def search(self, nums: List[int], target: int) -> int:
        i = self.findMin(nums)
        if target > nums[-1]:
            return self.lower_bound(nums, 0, i - 1, target)
        return self.lower_bound(nums, i, len(nums) - 1, target)
```

### [寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

```python
class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = 0, len(nums) - 1 # 以nums[-1]为分界
        pos = len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] <= nums[-1]:
                pos = mid
                right = mid - 1
            else:
                left = mid + 1

        return nums[pos]
```

### [寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

>i 和 j 表示左半部分一共要放多少个数
>
>j： `a` 里拿 `i` 个放到左边，从 `b` 里拿 `j` 个放到左边

```python
class Solution:
    def findMedianSortedArrays(self, a: List[int], b: List[int]) -> float:
        if len(a) > len(b):
            a,b = b,a

        m,n = len(a),len(b)
        a = [-inf] + a + [inf]
        b = [-inf] + b + [inf]

        i,j = 0,(m+n+1) // 2
        while True:
            if a[i] <= b[j+1] and b[j] <= a[i+1]: # 左半部分小于等于右半部分，且个数正好一半，所以找到了即是答案
                max1 = max(a[i],b[j])
                min2 = min(a[i+1],b[j+1])
                return max1 if (m+n) % 2 else (max1+min2) / 2 # 奇偶判断
            i += 1
            j -= 1
```

## 栈

### [有效的括号](https://leetcode.cn/problems/valid-parentheses/)

```python
class Solution:
    def isValid(self, s: str) -> bool:
        dic = {'{':'}','[':']','(':')','?':'?'}
        stack = ['?']
        for c in s:
            if c in dic: stack.append(c)
            elif dic[stack.pop()] != c: return False
        return len(stack) == 1
```

### [最小栈](https://leetcode.cn/problems/min-stack/)

```python
class MinStack:

    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, x: int) -> None:
        self.stack.append(x)
        if not self.min_stack or x <= self.min_stack[-1]:
            self.min_stack.append(x)

    def pop(self) -> None:
        if self.stack.pop() == self.min_stack[-1]: # self.stack.pop()已取出元素
            self.min_stack.pop()
        

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```

### [字符串解码](https://leetcode.cn/problems/decode-string/)

```python
class Solution:
    def decodeString(self, s: str) -> str:
        stack,res,multi = [],"",0
        for c in s:
            if c == '[':
                stack.append([multi,res])
                res,multi = "",0
            elif c == ']':
                cur_multi,last_res = stack.pop()
                res = last_res + cur_multi * res
            elif '0' <= c <= '9':
                multi = multi * 10 + int(c)
            else:
                res += c
        return res
```

### 每日温度

```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        length = len(temperatures)
        ans = [0]*length
        stack = []
        for i in range(length):
            temperature = temperatures[i]
            while stack and temperature > temperatures[stack[-1]]:#栈顶那天终于等到了一个更热的天
                prev_index = stack.pop()
                ans[prev_index] = i - prev_index
            stack.append(i)
        return ans
```

### [柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        n = len(heights)
        left = [-1]*n # 第 i 根柱子左边最近的、更矮的柱子下标
        st = [] # 存下标
        for i,h in enumerate(heights):
            #只要栈不空，并且栈顶柱子的高度 >= 当前柱子高度 h，就把栈顶弹出去。
            while st and heights[st[-1]] >= h:
                st.pop()
            if st:
                left[i] = st[-1]
            st.append(i)
        
        right = [n]*n
        st.clear()
        for i in range(n-1,-1,-1):
            h = heights[i]
            while st and heights[st[-1]] >= h:
                st.pop()
            if st:
                right[i] = st[-1]
            st.append(i)
        ans = 0
        for h,l,r in zip(heights,left,right):
            ans = max(ans,h*(r-l-1))
        return ans
```

## 堆

### [数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

```python
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        return sorted(nums)[len(nums) - k]
```

### [前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)

```python
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        d = {}
        for i in nums:
            d[i] = d.get(i,0)+1
        ls = list(d.items())
        ls.sort(key=lambda x:x[1],reverse=True)
        ans = []
        for i in range(k):
            ans.append(ls[i][0])
        return ans

```

### [数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

```python
class MedianFinder:

    def __init__(self):
        self.A = [] # 小跟堆，保存较大的一半
        self.B = [] # 大根堆，保存较小的一半，所以存的时候存负号
        # Python 只有小根堆，没有大根堆
    def addNum(self, num: int) -> None:
        if len(self.A) != len(self.B): # 当前A存的数比B多，将这个数放B里，但不能直接放，需要进行过滤
            heappush(self.A,num)
            heappush(self.B,-heappop(self.A))
        else: # A和B一样多，放A里，也需要过滤
            heappush(self.B,-num)
            heappush(self.A,-heappop(self.B))# 因为B里是取反值，A要真实值
        

    def findMedian(self) -> float:
        return self.A[0] if len(self.A) != len(self.B) else (self.A[0] - self.B[0]) / 2.0

```



## 贪心算法

### [买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        int ans = 0,minprice = prices[0];
        for(auto i : prices)
        {
            minprice = min(minprice,i);
            ans = max(ans,i - minprice);
        }
        return ans;
    }
};
```

### [跳跃游戏](https://leetcode.cn/problems/jump-game/)

只需每次考虑最远能跳到哪。维护一个当前能够跳到最远的变量$rightmost$,遍历数组，先看当前位置是否在当前能跳到的位置上，如果可以，更新$rightmost$。然后判断当前的$rightmost$是否$>=n-1$

```c++
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size();
        int rightmost = 0;//当前最远能够到达的位置
        for(int i = 0; i < n;i++)
        {
            if(i <= rightmost) 
            {
                rightmost = max(rightmost,i + nums[i]);
                if(rightmost >= n - 1) return true;
            }
        }
        return false;
    }
};
```

### [跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/)

每次找到**可到达**的**最远**位置

在遍历数组时，我们**不访问最后一个元素**，这是因为在访问最后一个元素之前，我们的边界一定大于等于最后一个位置，否则就无法跳到最后一个位置了。**如果访问最后一个元素**，在边界正好为最后一个位置的情况下，我们会增加一次「不必要的跳跃次数」，因此我们不必访问最后一个元素。

关于**这里**，详细解释下:如果访问最后一个元素，这种情况很好理解，之前已经能用更少的步数到达，不用再加次数，这里的依据是在**访问最后一个元素之前，我们的边界一定大于等于最后一个位置**。

那么**我们假设**访问最后一个元素之前，边界**小于**最后一个位置。也就是说当访问$i=n-2$时，$maxPos<n-1$。当到达$n-2$时，$maxPos = max(maxPos,n-2+nums[n-2])$，那么如果$maxPos$要小于$n-1$的话，就得确保$maxPos<=n-2$，那么可得

$nums[n-2]<=0$，题目中说$0 <= nums[i] <= 1000$，即$nums[n-2]=0$，那么在此刻$maxPos$是无法通过更新来比$n-2$大的，即无法到达$n-1$，而题目中说了，**保证可以到达**$n-1$,因此**假设错误**，即**访问最后一个元素之前，我们的边界一定大于等于最后一个位置**。

```c++
class Solution {
public:
    int jump(vector<int>& nums) {
        int maxPos = 0,n = nums.size(),end = 0,step = 0;
        for(int i = 0;i < n - 1;i++)
        {
            if(i <= maxPos)
            {   //maxPos是当前能够最远到达的距离
                maxPos = max(maxPos,i + nums[i]);
                if(i == end){//end是当前这一步能够到达的边界
                    end = maxPos;
                    step++;
                }
            }
        }
        return step;
    }
};
```

## 动态规划

### [爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

```c++
class Solution {
public:
    int climbStairs(int n) {
        vector<int> dp(n+1,0);
        dp[1] = 1;
        dp[0] = 1;
        for(int i = 2; i <= n; i ++)
            dp[i] = dp[i-1] + dp[i-2];
        return dp[n];
    }
};
```

### [杨辉三角](https://leetcode.cn/problems/pascals-triangle/)

```c++
class Solution {
public:
    vector<vector<int>> generate(int numRows) {
        vector<vector<int>> ret(numRows);
        for(int i = 0; i < numRows;i++)
        {
            ret[i].resize(i+1);
            ret[i][0] = ret[i][i] = 1;
            for(int j = 1; j < i;j++)
            ret[i][j] = ret[i-1][j-1] + ret[i-1][j];
        }
        return ret;
    }
};
```

### [打家劫舍](https://leetcode.cn/problems/house-robber/)

```c++
class Solution {
public:
    int rob(vector<int>& nums) {
        if(nums.empty()) return 0;

        int size = nums.size();
        if(size == 1) return nums[0];

        vector<int> dp = vector<int> (size,0);
        dp[0] = nums[0];
        dp[1] = max(nums[0],nums[1]);
        for(int i = 2; i < size;i++)
            dp[i] = max(dp[i-2]+nums[i],dp[i-1]);
        return dp[size-1];
        
    }
};
```

### [完全平方数](https://leetcode.cn/problems/perfect-squares/)

$f[i]$ 表示最少需要多少个数的平方来表示整数$i$

这道题的关键在于深刻理解$f[i]$是由前面的几个平方数加上最后一个**平方数**，

 举例子 (n = 13)

- `f[1] = f[0] + 1 = 1` → 1
- `f[2] = f[1] + 1 = 2` → 1+1
- `f[3] = f[2] + 1 = 3` → 1+1+1
- `f[4] = min(f[3], f[0]) + 1 = 1` → 4
- …
- `f[12] = min(f[11], f[8], f[3]) + 1 = 3` → 4+4+4
- `f[13] = min(f[12], f[9], f[4]) + 1 = 2` → 4+9

```c++
class Solution {
public:
    int numSquares(int n) {
        vector<int> f(n+1);
        for(int i = 1;i <= n;  i++)
        {
            int minn = INT_MAX;
            //枚举最后一个平方数之前的最少平方数是多少
            for(int j = 1;j * j <= i;j++) minn = min(minn,f[i-j*j]);

            f[i] = minn + 1;
        }
        return f[n];
    }
};
```

### [零钱兑换](https://leetcode.cn/problems/coin-change/)

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0 # dp[x]表示：凑出金额 x，最少需要多少枚硬币
        
        for coin in coins: # 一个硬币一个硬币地考虑
            for x in range(coin, amount + 1):#看这个硬币能不能帮我更新每个金额
            # 因为比 coin 小的金额，肯定没法用这个硬币凑
                dp[x] = min(dp[x], dp[x - coin] + 1) #要凑出金额x，我可以先凑出x - coin，然后再加上一枚coin
        return dp[amount] if dp[amount] != float('inf') else -1 
```

### [单词拆分](https://leetcode.cn/problems/word-break/)

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        max_len = max(map(len,wordDict))#求出单词表里，最长单词的长度
        words = set(wordDict)

        @cache
        def dfs(i:int) ->bool: #判断s的前i个字符，能不能被拆分成功
            if i == 0:
                return True
            for j in range(i-1,max(i-max_len-1,-1),-1):
                if s[j:i] in words and dfs(j):
                    return True
            return False
        return dfs(len(s))
```

### [最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/)

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        if not nums: return 0
        dp = [1] * len(nums)
        for i in range(len(nums)): # 枚举每一个位置
            for j in range(i):#哪些 nums[j] 可以接到 nums[i] 前面
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i],dp[j]+1)
        return max(dp)
```

### [乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/)

```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        n = len(nums)
        f_max = [0] * n # f_max[i]：以 nums[i] 结尾的子数组里，乘积最大是多少
        f_min = [0] * n # f_min[i]：以 nums[i] 结尾的子数组里，乘积最小是多少
        f_max[0] = f_min[0] = nums[0]
        for i in range(1,n):
            x = nums[i]
            f_max[i] = max(f_max[i-1]*x,f_min[i-1]*x,x)
            f_min[i] = min(f_max[i-1]*x,f_min[i-1]*x,x)
        return max(f_max)
```

### [分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/)

```python
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        @cache
        def dfs(i:int,j:int)->bool:#从 nums[0] 到 nums[i] 这些数里选，能不能凑出和 j
            if i < 0 :
                return j == 0
            return j >= nums[i] and dfs(i-1,j-nums[i]) or dfs(i-1,j) # 选/不选
        
        s = sum(nums)
        return s % 2 == 0 and dfs(len(nums) - 1,s // 2)
```

### [最长有效括号](https://leetcode.cn/problems/longest-valid-parentheses/)

```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        n = len(s)
        if n == 0:
            return 0
        dp = [0] * n # dp[i]表示：以 s[i] 这个位置结尾的最长有效括号长度
        stk = [] # 存没有被匹配的左括号的下标
        for i,c in enumerate(s):
            if c == '(':
                stk.append(i)
            elif len(stk) > 0:
                top = stk[-1]
                stk.pop()
                # 已形成的有效长度＋之前的最长有效长度
                dp[i] = i - top + 1 + (dp[top-1] if top >= 1 else 0 )
        return max(dp)
```

## 多维动态规划

### [不同路径](https://leetcode.cn/problems/unique-paths/)

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        @cache
        def dfs(i:int,j:int) ->int: #dfs(i, j)表示：走到位置 (i, j)，一共有多少种走法。
            if i < 0 or j < 0:
                return 0
            if i == 0 and j == 0:
                return 1
            return dfs(i-1,j) + dfs(i,j-1)
        return dfs(m-1,n-1)
```

### [最小路径和](https://leetcode.cn/problems/minimum-path-sum/)

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if i == j == 0:continue
                #grid[i][j] 表示：从左上角走到 (i,j) 这个位置的最小路径和
                elif i == 0: grid[i][j] = grid[i][j-1] + grid[i][j]
                elif j == 0: grid[i][j] = grid[i-1][j] + grid[i][j]
                else: grid[i][j] = min(grid[i-1][j],grid[i][j-1])+grid[i][j]
        return grid[-1][-1]
```

### [最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        if n < 2:
            return s
        
        max_len = 1 # 当前找到的最长回文子串长度
        begin = 0 # 这个最长回文子串的起始位置
        dp = [[False] * n for _ in range(n)] # dp[i][j] 表示：子串 s[i:j+1] 是不是回文串
        for i in range(n):
            dp[i][i] = True
        
        for L in range(2,n+1): # 当前考虑的子串长度
            for i in range(n): # i是起点，L是长度，j是终点
                j = L + i - 1
                if j >= n:
                    break
                if s[i] != s[j]:
                    dp[i][j] = False
                else:
                    if j - i < 3: # 长度为2 / 3
                        dp[i][j] = True
                    else:
                        dp[i][j] = dp[i+1][j-1] # 看中间那段是不是回文

                if dp[i][j] and j-i+1 > max_len:
                    max_len = j - i + 1
                    begin = i
        return s[begin:begin+max_len]
```

### [最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)

```python
class Solution:
    def longestCommonSubsequence(self, s: str, t: str) -> int:
        n,m = len(s),len(t)
        @cache
        def dfs(i:int,j:int) ->int: # dfs(i, j)表示：s[0~i] 和 t[0~j] 这两段字符串的最长公共子序列长度
            if i < 0  or j < 0:
                return 0
            if s[i] == t[j]:
                return dfs(i-1,j-1) + 1
            return max(dfs(i-1,j),dfs(i,j-1))# 选大的
        # 选大的
        return dfs(n-1,m-1)
```

### 编辑距离

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word1)
        m = len(word2)

        if n * m == 0:
            return n + m
        
        #D[i][j]表示word1的前 i 个字符，变成word2的前 j 个字符，最少需要多少步
        D = [ [0] * (m+1) for _ in range(n+1)]

        for i in range(n+1):
            D[i][0] = i
        for j in range(m+1):
            D[0][j] = j

        for i in range(1,n+1):
            for j in range(1,m+1):
                # 先把 word1 前 i-1 个字符变成 word2 前 j 个字符，然后再删除 word1 的第 i 个字符
                left = D[i-1][j] + 1
                down = D[i][j-1] + 1 # 插入
                left_down = D[i-1][j-1]  # 替换
                if word1[i-1] != word2[j-1]:
                    left_down += 1
                D[i][j] = min(left,down,left_down)
            
        return D[n][m]
```

## 技巧

### [只出现一次的数字](https://leetcode.cn/problems/single-number/)

```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        x = 0
        for num in nums:
            x ^= num # 异或
        return x
```

### [多数元素](https://leetcode.cn/problems/majority-element/)

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        votes = 0 # 当前候选人 x 的“票数优势”
        for num in nums:
            if votes == 0: x = num # 如果票数是 0，就换候选人
            votes += 1 if num == x else -1
        return x
```

### [颜色分类](https://leetcode.cn/problems/sort-colors/)

```python
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        p0 = p1 = 0 # p0表示：下一个应该放 0 的位置
        # p1表示：下一个应该放 1 的位置
        for i,x in enumerate(nums):
            nums[i] = 2
            if x <= 1:
                nums[p1] = 1
                p1 += 1
            if x == 0:
                nums[p0] = 0
                p0 += 1
```

### [下一个排列](https://leetcode.cn/problems/next-permutation/)

```python
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        i = n - 2 #为了“只大一点点”，应该尽量改靠右的位置
        while i >= 0 and nums[i] >= nums[i+1]:
            i -=  1

        if i >= 0: # 从右边找一个数来跟nums[i]交换
            j = n - 1
            while nums[j] <= nums[i]: # 从右往左，第一个比 nums[i] 大的数
                j -= 1
            nums[i],nums[j] = nums[j],nums[i]
        
        left,right = i + 1, n - 1  # 反转 nums[i+1:]
        while left < right:
            nums[left],nums[right] = nums[right],nums[left]
            left += 1
            right -= 1
```




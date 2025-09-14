---
title: 力扣Hot100
description:  ​​力扣Hot100​​热门算法题库的题解，涵盖了​哈希、双指针、滑动窗口、子串、普通数组、矩阵、链表、回溯、贪心算法、动态规划​​等核心算法与数据结构。
date: 2025-08-22 10:15:04
updated: 2025-08-22 10:15:04
# image:
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

::pic
---
src: https://7.isyangs.cn/20250819/8f0b5e48eebee6a5b15307ad03e57ac7.png
caption:
---
::

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

具体来说，对于遍历到的数$x$ ，如果它在 $[1,N] $的范围内，那么就将数组中的第$x−1 $个位置打上标记

**也就是说**，数组下标$i$对应着正数$i+1$，第一个没被标记的位置，其就是答案，对应的数为$i+1$

```c++
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for(int &i : nums){
            if(i <= 0) i = n + 1;
        }

        for(int i = 0; i < n;  i++)
        {
            int num = abs(nums[i]);
            if(num <= n)//进行标记
                nums[num-1] = -abs(nums[num-1]);//变成负数
        }
        for(int i = 0;i < n; i ++)
        {
            if(nums[i] > 0) return i + 1;
        }
        return n + 1;//1-n的正数全部出现
    }
};
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

::pic
---
src: https://7.isyangs.cn/20250822/e30ded2a642f00c5f3614895d87b9628.png
caption:
---
::

偶数如图所示，只需枚举四个块中一个即可，为了方便起见，选择蓝色的块。而当奇数时，要考虑下，

::pic
---
src: https://7.isyangs.cn/20250824/7dd6de267732fb29496be9516813ec7f.webp
caption:
---
::

同样四种颜色块选一个，这里我们将图中垂直纸面向左外翻转，枚举青色的这块，正好和偶数的能够对应上了。

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


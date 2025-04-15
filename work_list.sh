#!/bin/bash

# 生成Markdown格式的周报
echo "# $(pwd) 开发周报 ($(date +'%Y-%m-%d'))"
echo ""
echo "## 本周提交统计"
echo ""
echo "| 开发者 | 提交次数 | 新增行数 | 删除行数 |"
echo "|--------|---------|---------|---------|"

git log --since="1 week ago" --pretty=tformat: --numstat | \
  awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "| 总计 | - | %d | %d |\n", add, subs }'

git log --since="1 week ago" --format='%aN' | sort -u | while read author; do
  echo -n "| $author | "
  git log --since="1 week ago" --author="$author" --oneline | wc -l | tr -d '\n'
  echo -n " | "
  git log --since="1 week ago" --author="$author" --pretty=tformat: --numstat | \
    awk '{ add += $1; subs += $2 } END { printf "%d | %d |\n", add, subs }'
done

echo ""
echo "## 本周主要变更"
echo ""
git log --since="1 week ago" --pretty=format:"- %s (%an, %ad)" --date=short --no-merges
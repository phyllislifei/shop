<template>
 <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table
        :border="true"
        :stripe="true"
        :data="rightList"
        style="width: 100%">
        <el-table-column
          label="#"
          type="index">
        </el-table-column>
        <el-table-column
          label="权限名称"
          prop="authName">
        </el-table-column>
        <el-table-column
          label="路径"
          prop="path">
        </el-table-column>
        <el-table-column
          label="权限等级"
          prop="level">
         <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
         </template>
        </el-table-column>
      </el-table>
    </el-card>
 </div>
</template>

<script>
export default {
  data() {
    return {
      rightList: null
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败');
      } else {
        this.$message.success(res.meta.msg)
        this.rightList = res.data
      }
    }
  },
}
</script>
<style lang="less" scoped>

</style>

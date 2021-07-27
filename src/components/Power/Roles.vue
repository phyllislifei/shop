<template>
 <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
       <el-button type="primary">添加角色</el-button>
        <el-table
         :data="rolesList"
         border>
         <!-- 展开列 -->
   <el-table-column type="expand">
            <template slot-scope="props">
               <el-form label-position="left" inline class="demo-table-expand">
                   <!-- <pre>{{ props.row.children }}</pre> -->
                   <el-row v-for="(item1, index1) in props.row.children" :key="item1.id"  :class="['bdbottom', index1===0?'bdtop':'','vcenter']">
                      <!-- 渲染一级权限 -->
                      <el-col :span="5">
                         <el-tag   @close="removeRightByID(props.row, item1.id)"
                              closable>{{item1.authName}}</el-tag>
                         <i class="el-icon-caret-right"></i>
                      </el-col>
                       <!-- 渲染二级三级权限 -->
                      <el-col :span="19">
                         <!-- 通过for循环嵌套渲染二级权限 -->
                        <el-row class="vcenter" v-for="(item2,index2) in item1.children" :class="[index2===0?'':'bdtop']" :key="item2.id">
                           <!-- 渲染二级权限 -->
                           <el-col :span="6">
                              <el-tag type="success" @close="removeRightByID(props.row, item2.id)"
                              closable>{{item2.authName}}</el-tag>
                              <i class="el-icon-caret-right"></i>
                           </el-col>
                           <!-- 渲染三级权限 -->
                           <el-col :span="18">
                             <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id"
                              @close="removeRightByID(props.row, item3.id)"
                              closable>
                                 {{item3.authName}}
                             </el-tag>
                           </el-col>
                        </el-row>
                      </el-col>
                   </el-row>
               </el-form>
            </template>索引列
            <!--  -->
      </el-table-column>
         <el-table-column
           type="index"
            label="#">
         </el-table-column>
         <el-table-column
            prop="roleName"
            label="角色名称">
         </el-table-column>
         <el-table-column
            prop="roleDesc"
            label="角色描述">
         </el-table-column>
         <el-table-column
            label="操作"
            width="300px">
            <template slot-scope="scope">
               <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
               <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
               <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
         </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
   <el-dialog
      title="分配权限"
      :visible.sync=" setRightDialogVisible"
      width="50%">
      <!-- 树形控件 -->
      <el-tree :data="rightsList"
         :props="setRightsProps"
         node-key="id"
         :default-expand-all="true"
         :default-checked-keys = "defaultKeys"
         ref="treeRef"
         show-checkbox>
      </el-tree>
      <span slot="footer" class="dialog-footer">
         <el-button @click=" setRightDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
   </el-dialog>
 </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: null,
      // 控制分配权限的对话框的显示和隐藏
      setRightDialogVisible: false,
      // 权限列表数据
      rightsList: null,
      setRightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的key的数组
      defaultKeys: [],
      // 权限id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表数据失败');
      } else {
        this.rolesList = res.data
      }
    },
    //  删除权限
    async removeRightByID(role, rightId) {
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('用户取消了删除')
      }
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
      if (res.meta.status !== 200) {
        return this.$message.error('用户权限没有删除成功')
      } else {
        this.$message.success(res.meta.msg)
        role.children = res.data
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      //  保存权限id，allotRights函数要用
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 把获取到的权限数据保存在data中
      this.rightsList = res.data
      this.getDefKeys(role)
      this.setRightDialogVisible = true
    },
    //  获取默认勾选的key(通过递归的形式获取所有角色下三级权限的id)
    getDefKeys(node) {
      //  如果当前node节点不包含children属性，就是三级节点
      if (!node.children) {
        return this.defaultKeys.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefKeys(item)
      });
    },
    //  获取选中状态和半选中状态的id,发起请求权限分配的请求
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()].join(',')
      const { data: res } = await this.$http.post('roles/' + parseInt(this.roleId) + '/rights', { rids: keys })
      if (res.meta.status !== 200) {
        return this.$message.error('权限分配失败')
      }
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
   margin: 7px
}
.bdtop {
   border-top: 1px solid #eee;
}
.bdbottom {
   border-bottom: 1px solid #eee;
}

.vcenter {
   display: flex;
   align-items: center;
}
</style>

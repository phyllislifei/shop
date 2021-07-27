<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>

    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
    <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
     </el-row>
     <!-- 用户列表区域 -->
     <el-table :data="userList" :border="true" :stripe="true">
       <el-table-column label="#" type="index"></el-table-column>
       <el-table-column label="姓名" prop="username"></el-table-column>
       <el-table-column label="邮箱" prop="email"></el-table-column>
       <el-table-column label="电话" prop="mobile"></el-table-column>
       <el-table-column label="角色" prop="role_name"></el-table-column>
       <el-table-column label="状态">
         <template slot-scope="scope">
           <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChanged(scope.row)">
          </el-switch>
         </template>
       </el-table-column>
       <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button @click="showEditDialog(scope.row.id)" type="primary" icon="el-icon-edit" circle></el-button>
          <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)" circle></el-button>
          <el-button type="warning" icon="el-icon-setting" @click="setRole(scope.row)" circle></el-button>
        </template>
       </el-table-column>
     </el-table>
     <!-- 分页 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户弹出框 -->
    <el-dialog
      title="添加用户"
      width="50%"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed">
      <!-- 内容主题区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
     <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
        <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.email"></el-input>
      </el-form-item>
        <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUser">确 定</el-button>
     </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      @close="setRoleDialogClosed"
      width="50%">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色</p>
        <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    // 校验邮箱规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([A-Za-z0-9_-])+@([A-Za-z0-9_-])+(\.[A-Za-z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      } else {
        callback(new Error('请输入合法的邮箱'))
      }
    }
    // 校验手机号规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法手机号码
        return callback()
      } else {
        callback(new Error('请输入合法的手机号码'))
      }
    }
    return {
      // 需要进行分配角色的id
      roleId: 0,
      // 选中的id值（select组件的下拉表单）
      selectRoleId: null,
      // 控制分配角色弹出框的显示和隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {
        username: '',
        role_name: ''
      },
      // 角色列表的信息
      roleList: null,
      // 控制修改用户对话框
      editDialogVisible: false,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户的现实和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 编辑用户表单验证
      editFormRules: {
        email: [
          { required: true, validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表数据失败')
      } else {
        this.$message.success(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total
      }
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // swich开关状态改变
    async userStateChanged(userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put('users/' + userInfo.id + '/state/' + userInfo.mg_state)
      if (res.meta.status !== 200) {
        return this.$message.error('状态切换失败')
      } else {
        this.$message.success(res.meta.msg)
      }
    },
    // 监听添加用户表单关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          // 可以发起添加用户的网络请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加新用户失败')
          } else {
            this.$message.success(res.meta.msg)
            this.addDialogVisible = false
            this.getUserList()
          }
        }
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$http.error('查询用户信息失败')
      } else {
        this.editForm = res.data
        this.editDialogVisible = true
      }
    },
    // 编辑用户数据重置,监听用户修改框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    // 编辑完用户数据提交
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error('修改用户信息失败')
          } else {
            this.$message.success(res.meta.msg)
          }
          this.editDialogVisible = false
        }
      })
    },
    // 删除用户
    removeUserById(id) {
      // 询问是否删除数据
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        } else {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getUserList()
        }
      }).catch(() => {
        this.$message.success('已删除取消')
      })
    },
    // 展示分配角色的对话框
    async setRole(role) {
      // 在展示对话框之前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      this.roleList = res.data
      this.userInfo = role
      this.roleId = role.id
      this.setRoleDialogVisible = true
    },
    // 点击确定，修改用户角色
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      } else {
        const { data: res } = await this.$http.put('users/' + this.roleId + '/role', {
          rid: this.selectRoleId
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('分配角色失败')
        } else {
          this.$message.success(res.meta.msg)
          this.getUserList()
          this.setRoleDialogVisible = false
        }
      }
    },
    // 修改角色对话框关闭的时候执行的时间，清空用户信息
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style lang="less" scoped>
.el-button {
  margin-left: 5px;
}

</style>

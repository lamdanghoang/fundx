from flask import Flask, jsonify, request
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise EnvironmentError("SUPABASE_URL or SUPABASE_KEY isn't set up in .env")

supabase: Client = create_client(supabase_url, supabase_key)

# Middleware
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@app.route('/')
def hello_world():
    return jsonify({"message": "Welcome to FundX backend!"})

# 1. Get list of projects
@app.route('/projects', methods=['GET'])
def get_projects():
    try:
        # Get project is raising funds
        response = supabase.table("projects").select("*").is_("is_completed", False).execute()
        print(response)
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# 2. Create a new project
@app.route('/create-project', methods=['POST'])
def create_project():
    try:
        data = request.json
        if not all(key in data for key in ['blob_id', 'creator', 'name', 'target_amount', 'reward_type', 'img_blob_id', 'currency', 'early_investor_limit']):
            return jsonify({"error": "Missing required fields"}), 400

        response = supabase.table("projects").insert(data).execute()
        return jsonify(response.data[1][0]), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# 3. Create a new contribution
@app.route('/contribute', methods=['POST'])
def create_contribute():
    try:
        data = request.json
        if not all(key in data for key in ['project_blob_id', 'investor_address', 'amount', 'tx_hash', 'contribution_type']):
            return jsonify({"error": "Missing required fields"}), 400

        response = supabase.table("contributions").insert(data).execute()
        return jsonify(response.data[1][0]), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# # 2. Get project information from slug
# @app.route('/projects/<slug>', methods=['GET'])
# def get_project_detail(slug):
#     try:
#         project_response = supabase.table("projects").select("*").eq("slug", slug).single().execute()
#  
#         project = project_response.data

#         details_response = supabase.table("project_details").select("title, content, order_number").eq("project_id", project['id']).order("order_number").execute()
#         project['details'] = details_response.data

#         roadmaps_response = supabase.table("project_roadmaps").select("stage, description, start_date, end_date, order_number, is_completed").eq("project_id", project['id']).order("order_number").execute()
#         project['roadmaps'] = roadmaps_response.data

#         members_response = supabase.table("project_members").select("member_name, role").eq("project_id", project['id']).execute()
#         project['members'] = members_response.data

#         updates_response = supabase.table("updates").select("title, content, created_at").eq("project_id", project['id']).order("created_at", desc=True).execute()
#         project['updates'] = updates_response.data

#         contributions_response = supabase.table("contributions").select("investor_id, amount, contribution_time, investment_type_id").eq("project_id", project['id']).execute()
#         project['contributions'] = contributions_response.data

#         investors_data = []
#         if project['contributions']:
#             investor_ids = [contribution['investor_id'] for contribution in project['contributions'] if contribution['investor_id']]
#             investors_response = supabase.table("investors").select("id, full_name").in_("id", investor_ids).execute()
#             investors_dict = {investor['id']: investor['full_name'] for investor in investors_response.data}
#             investment_types_response = supabase.table("investment_types").select("id, name").execute()
#             investment_types_dict = {item['id']: item['name'] for item in investment_types_response.data}

#             for contribution in project['contributions']:
#                 investor_name = investors_dict.get(contribution['investor_id'], "Ẩn danh")
#                 investment_type_name = investment_types_dict.get(contribution['investment_type_id'], "Không xác định")
#                 investors_data.append({
#                     "name": investor_name,
#                     "amount": contribution['amount'],
#                     "time": contribution['contribution_time'],
#                     "type": investment_type_name
#                 })
#         project['investors'] = investors_data

#         return jsonify(project), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # 4. Contribute a project
# @app.route('/contribute', methods=['POST'])
# def contribute():
#     try:
#         data = request.json
#         project_id = data.get('project_id')
#         investor_id = data.get('investor_id')
#         amount = data.get('amount')
#         investment_type_id = data.get('investment_type_id')

#         if not all([project_id, investor_id, amount, investment_type_id]):
#             return jsonify({"error": "Missing required fields"}), 400

#         # Get information of project to check early invertor limit
#         project_response = supabase.table("projects").select("target_amount, current_amount, early_investor_limit, early_investor_amount").eq("id", project_id).single().execute()
#         if project_response.error:
#             return jsonify({"error": "Project not exist"}), 404
#         project_data = project_response.data

#         if investment_type_id == 'early':
#             if project_data['early_investor_limit'] is not None and project_data['early_investor_amount'] >= project_data['early_investor_limit']:
#                 return jsonify({"error": "No early investment slot left."}), 400

#         # Proceed to contribute
#         contribution_data = {
#             "project_id": project_id,
#             "investor_id": investor_id,
#             "amount": amount,
#             "investment_type_id": investment_type_id
#         }
#         contribution_response = supabase.table("contributions").insert(contribution_data).execute()
#         if contribution_response.error:
#             return jsonify({"error": contribution_response.error}), 500

#         # Update current amount of project
#         new_current_amount = project_data['current_amount'] + amount
#         update_data = {"current_amount": new_current_amount}
#         if investment_type_id == 'early':
#             new_early_investor_amount = project_data['early_investor_amount'] + amount
#             update_data["early_investor_amount"] = new_early_investor_amount

#         update_project_response = supabase.table("projects").update(update_data).eq("id", project_id).execute()

#         return jsonify({"message": "Contributed successfully!"}), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # 5. Thêm thông tin cập nhật cho dự án (cần xác thực và ủy quyền)
# @app.route('/projects/<project_id>/updates', methods=['POST'])
# def add_project_update(project_id):
#     try:
#         data = request.json
#         # **Quan trọng:** Thêm xác thực người dùng và kiểm tra quyền ở đây
#         if not all(key in data for key in ['title', 'content']):
#             return jsonify({"error": "Missing required fields"}), 400

#         update_data = {"project_id": project_id, "title": data['title'], "content": data['content']}
#         response = supabase.table("updates").insert(update_data).execute()
#         if response.error:
#             return jsonify({"error": response.error}), 500
#         return jsonify(response.data[1][0]), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
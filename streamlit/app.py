"""
Main Streamlit application for ResQLink AI/testing dashboard.
"""
import streamlit as st
import sys
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_path))

# Import pages
from pages import vision_test, risk_test, briefing_test, mesh_test

def main():
    st.set_page_config(
        page_title="ResQLink AI Dashboard",
        page_icon="🆘",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # Sidebar navigation
    st.sidebar.title("ResQLink AI")
    st.sidebar.markdown("*Emergency Intelligence Platform*")

    page = st.sidebar.selectbox(
        "Navigate to",
        ["Overview", "Vision Testing", "Risk Analysis Testing", "Briefing Generation", "Mesh Network Testing", "Settings"]
    )

    # Display selected page
    if page == "Overview":
        show_overview()
    elif page == "Vision Testing":
        vision_test.show()
    elif page == "Risk Analysis Testing":
        risk_test.show()
    elif page == "Briefing Generation":
        briefing_test.show()
    elif page == "Mesh Network Testing":
        mesh_test.show()
    elif page == "Settings":
        show_settings()

def show_overview():
    st.title("ResQLink AI Dashboard")
    st.markdown("### Emergency Intelligence Platform - AI Testing Interface")

    col1, col2 = st.columns(2)

    with col1:
        st.info("""
        **This dashboard provides tools for testing and validating AI components** of the ResQLink emergency response system.

        Use the navigation sidebar to access:
        - **Vision Testing**: Test YOLOv8 object detection on disaster imagery
        - **Risk Analysis Testing**: Experiment with risk scoring algorithms
        - **Briefing Generation**: Generate AI-powered situation briefings
        - **Mesh Network Testing**: Simulate peer-to-peer communication scenarios
        """)

    with col2:
        st.warning("""
        **Important Notes:**
        - This is a testing/development interface
        - For production use, use the main React application
        - AI components use mock providers when API keys are unavailable
        - All data is simulated for demonstration purposes
        """)

    # System status
    st.subheader("System Status")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("AI Provider", "Mock (Demo Mode)", "OFFLINE")

    with col2:
        st.metric("Vision Model", "YOLOv8n", "LOADED" if True else "NOT LOADED")

    with col3:
        st.metric("Database", "Simulated", "DEMO MODE")

    with col4:
        st.metric("Mesh Network", "Simulated", "8 PEERS")

def show_settings():
    st.title("Settings")
    st.subheader("API Configuration")

    st.info("In a production environment, configure API keys in the backend/.env file:")
    st.code("""
# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# GenAI API Keys
GEMINI_API_KEY=your_gemini_api_key_here


# Application
DEMO_MODE=false
""")

    st.subheader("Demo Data")
    if st.button("Load Sample Disaster Data"):
        st.success("Sample data loaded! (In a real implementation, this would populate the database)")

    if st.button("Reset to Default State"):
        st.warning("Reset functionality would clear all test data and restore defaults")

if __name__ == "__main__":
    main()
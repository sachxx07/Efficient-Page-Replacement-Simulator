
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv){
    if(argc < 3) { cerr << "{\"error\":\"Usage\"}"; return 1; }
    int frames = stoi(argv[1]);
    string refs_s = argv[2];
    vector<int> refs; string token;
    for(char c: refs_s){
        if(c==','){ if(!token.empty()){ refs.push_back(stoi(token)); token.clear(); } }
        else token.push_back(c);
    }
    if(!token.empty()) refs.push_back(stoi(token));

    vector<int> frame(frames, -1);
    unordered_map<int,int> lastUsed; 
    int hits=0, misses=0;
    struct Step{ int ref; vector<int> state; string result; int idx; };
    vector<Step> steps;

    for(int i=0;i<refs.size();++i){
        int r = refs[i];
        if(find(frame.begin(), frame.end(), r) != frame.end()){
            hits++;
            lastUsed[r] = i;
            steps.push_back({r, frame, "hit", i});
        } else {
            misses++;
            bool placed=false;
            for(int j=0;j<frames;++j){
                if(frame[j]==-1){
                    frame[j] = r;
                    lastUsed[r] = i;
                    placed=true;
                    break;
                }
            }
            if(!placed){
                int lruIdx = -1;
                int lruPage = 0;
                int oldest = INT_MAX;
                for(int j=0;j<frames;++j){
                    int pg = frame[j];
                    int lu = lastUsed.count(pg) ? lastUsed[pg] : -1;
                    if(lu < oldest){ oldest = lu; lruIdx = j; lruPage = pg; }
                }
                frame[lruIdx] = r;
                lastUsed.erase(lruPage);
                lastUsed[r] = i;
            }
            steps.push_back({r, frame, "miss", i});
        }
    }

    cout << "{";
    cout << "\"frames\":" << frames << ",";
    cout << "\"sequence\":[";
    for(int i=0;i<refs.size();++i){ if(i) cout<<","; cout<<refs[i]; }
    cout << "],";
    cout << "\"hits\":" << hits << ",";
    cout << "\"misses\":" << misses << ",";
    cout << "\"steps\":[";
    for(int i=0;i<steps.size();++i){
        if(i) cout<<",";
        cout << "{";
        cout << "\"ref\":"<<steps[i].ref<<",";
        cout << "\"idx\":"<<steps[i].idx<<",";
        cout << "\"result\":\""<<steps[i].result<< "\",";
        cout << "\"state\":[";
        for(int j=0;j<frames;++j){ if(j) cout<<","; cout<<steps[i].state[j]; }
        cout << "]}";
    }
    cout << "]";
    cout << "}\n";
    return 0;
}